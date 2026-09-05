// Execute na raiz do portal: node --test pix/tests/account.test.cjs
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const { runInNewContext } = require("node:vm");
const context = { window: {} };
runInNewContext(readFileSync(resolve(__dirname, "../../js/pix-account.js"), "utf8"), context);
const { createAccount, parseMoney } = context.window.BancoUnapi;

test("valores em centavos: formatos brasileiros, limites e entradas inválidas", () => {
  for (const [input, cents] of [["0,01", 1], ["12.34", 1234], ["R$ 1.250,00", 125000], ["10.000,00", 1000000]]) {
    assert.equal(parseMoney(input), cents);
  }
  for (const input of ["", "0", "-10", "NaN", "Infinity", "1e3", "10,001", "1.2.3,45", "12.34,56", "10000,01", "<script>"]) {
    assert.equal(parseMoney(input), null, input);
  }
});

test("Pix só aceita destinatário do catálogo e nunca cria saldo negativo", () => {
  const account = createAccount();
  account.payPix("email", 1234);
  assert.equal(account.snapshot().balanceCents, 123766);
  const before = JSON.stringify(account.snapshot());
  for (const [id, value] of [["email", 123767], ["email", -1], ["email", 0.5], ["__proto__", 100], ["real@example.com", 100]]) {
    assert.throws(() => account.payPix(id, value));
    assert.equal(JSON.stringify(account.snapshot()), before);
  }
});

test("contas e fatura são debitadas uma única vez", () => {
  const account = createAccount();
  account.payBill("water");
  account.payInvoice();
  assert.equal(account.snapshot().balanceCents, 97870);
  assert.equal(account.snapshot().card.invoiceCents, 0);
  const before = JSON.stringify(account.snapshot());
  assert.throws(() => account.payBill("water"));
  assert.throws(() => account.payInvoice());
  assert.equal(JSON.stringify(account.snapshot()), before);
});

test("falha por saldo insuficiente não marca conta ou fatura como paga", () => {
  const account = createAccount();
  account.payPix("email", 125000);
  assert.throws(() => account.payBill("energy"));
  assert.throws(() => account.payInvoice());
  assert.equal(account.snapshot().paidBills.length, 0);
  assert.equal(account.snapshot().card.invoiceCents, 18490);
});

test("guardar e resgatar conservam a soma entre conta e reserva", () => {
  const account = createAccount();
  for (const [value, direction] of [[10000, "save"], [1234, "withdraw"], [500, "save"], [9266, "withdraw"]]) {
    account.moveReserve(value, direction);
    const snapshot = account.snapshot();
    assert.equal(snapshot.balanceCents + snapshot.reserveCents, 125000);
  }
  assert.equal(account.snapshot().reserveCents, 0);
  const before = JSON.stringify(account.snapshot());
  for (const [value, direction] of [[1, "withdraw"], [125001, "save"], [1, "invalid"]]) {
    assert.throws(() => account.moveReserve(value, direction));
    assert.equal(JSON.stringify(account.snapshot()), before);
  }
});

test("extrato reconcilia o saldo e gera identificadores únicos", () => {
  const account = createAccount();
  account.payPix("phone", 1234);
  account.payBill("internet");
  account.receive(2345);
  account.moveReserve(700, "save");
  const { transactions, balanceCents } = account.snapshot();
  assert.equal(transactions.reduce((sum, item) => sum + (item.direction === "in" ? 1 : -1) * item.amountCents, 0), balanceCents);
  assert.equal(new Set(transactions.map(item => item.id)).size, transactions.length);
});

test("cartões, preferências e limite ficam independentes do saldo", () => {
  const account = createAccount();
  account.toggleCard("locked");
  account.createVirtualCard();
  account.toggleCard("virtualLocked");
  account.toggleCard("online");
  account.setLimit(100000);
  const { card, balanceCents } = account.snapshot();
  assert.equal(card.locked, true);
  assert.equal(card.virtual, true);
  assert.equal(card.virtualLocked, true);
  assert.equal(card.online, false);
  assert.equal(card.limitCents, 100000);
  assert.equal(balanceCents, 125000);
  assert.throws(() => account.setLimit(1));
});

test("snapshots não alteram a conta e uma nova instância reinicia tudo", () => {
  const account = createAccount();
  const snapshot = account.snapshot();
  snapshot.balanceCents = 1;
  snapshot.card.locked = true;
  snapshot.transactions[0].amountCents = 1;
  assert.equal(account.snapshot().balanceCents, 125000);
  assert.equal(account.snapshot().card.locked, false);
  assert.equal(account.snapshot().transactions[0].amountCents, 9000);
  account.payPix("email", 2000);
  account.toggleBalance();
  assert.equal(createAccount().snapshot().balanceCents, 125000);
  assert.equal(createAccount().snapshot().hiddenBalance, false);
});
