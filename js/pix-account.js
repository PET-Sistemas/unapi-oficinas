(() => {
  "use strict";

  // A conta inteira vive nesta instância. Não há transporte nem persistência.
  const contacts = Object.freeze({
    email: Object.freeze({ id: "email", type: "email", name: "Maria Ferreira dos Santos", shortName: "Maria Ferreira", initials: "MF", label: "E-mail", key: "maria.treino@bancounapi.local", documentLabel: "CPF", document: "***.456.789-**" }),
    phone: Object.freeze({ id: "phone", type: "phone", name: "João Batista de Oliveira", shortName: "João Batista", initials: "JB", label: "Celular", key: "+55 67 90000-0000", documentLabel: "CPF", document: "***.321.654-**" }),
    document: Object.freeze({ id: "document", type: "document", name: "Cantina UnAPI", shortName: "Cantina UnAPI", initials: "CU", label: "CPF/CNPJ", key: "12.345.678/0001-90", documentLabel: "CNPJ", document: "12.345.678/0001-90" }),
    random: Object.freeze({ id: "random", type: "random", name: "Centro de Convivência UnAPI", shortName: "Centro UnAPI", initials: "UC", label: "Chave aleatória", key: "UNAPI-TREINO-2026-CHAVE-ALEATORIA", documentLabel: "CNPJ", document: "98.765.432/0001-10" }),
    own: Object.freeze({ id: "own", type: "email", name: "Maria Oliveira", shortName: "Maria Oliveira", initials: "MO", label: "E-mail", key: "maria.oliveira@bancounapi.local", documentLabel: "CPF", document: "***.123.456-**" }),
  });

  const bills = Object.freeze([
    Object.freeze({ id: "water", name: "Água e saneamento", company: "Águas da Oficina", initials: "AO", amountCents: 8640, code: "UNAPI-AGUA-08640", document: "11.222.333/0001-00", dueDay: 12 }),
    Object.freeze({ id: "energy", name: "Energia elétrica", company: "Energia UnAPI", initials: "EU", amountCents: 12490, code: "UNAPI-LUZ-12490", document: "22.333.444/0001-00", dueDay: 18 }),
    Object.freeze({ id: "internet", name: "Internet", company: "Conecta Oficina", initials: "CO", amountCents: 9990, code: "UNAPI-INTERNET-09990", document: "33.444.555/0001-00", dueDay: 22 }),
  ]);

  function parseMoney(value) {
    let text = String(value).trim().replace(/\s|R\$/gi, "");
    if (text.includes(",")) {
      if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+),\d{1,2}$/.test(text)) return null;
      text = text.replace(/\./g, "").replace(",", ".");
    }
    if (!/^\d+(?:\.\d{1,2})?$/.test(text)) return null;
    const cents = Math.round(Number(text) * 100);
    return Number.isSafeInteger(cents) && cents > 0 && cents <= 1000000 ? cents : null;
  }

  function createAccount() {
    let serial = 0;
    const now = new Date();
    const dateBefore = days => new Date(now.getTime() - days * 86400000).toISOString();
    const bank = {
      balanceCents: 125000, reserveCents: 0, hiddenBalance: false,
      card: { locked: false, online: true, contactless: true, virtual: false, virtualLocked: false, limitCents: 200000, invoiceCents: 18490 },
      paidBills: [],
      transactions: [
        { id: "UNAPI-INICIO-04", date: dateBefore(1), amountCents: 9000, direction: "out", kind: "payment", name: "Água e saneamento", description: "Pagamento de conta", documentLabel: "CNPJ", document: "11.222.333/0001-00", source: "Conta" },
        { id: "UNAPI-INICIO-03", date: dateBefore(2), amountCents: 3500, direction: "out", kind: "pix", name: "Farmácia da Oficina", description: "Pix enviado", documentLabel: "CNPJ", document: "44.555.666/0001-00", source: "Chave Pix" },
        { id: "UNAPI-INICIO-02", date: dateBefore(3), amountCents: 12500, direction: "out", kind: "pix", name: "Mercado da Praça", description: "Pix enviado", documentLabel: "CNPJ", document: "55.666.777/0001-00", source: "QR Code" },
        { id: "UNAPI-INICIO-01", date: dateBefore(4), amountCents: 150000, direction: "in", kind: "income", name: "Crédito em conta", description: "Valor recebido", documentLabel: "Origem", document: "Banco UnAPI", source: "Crédito" },
      ],
    };
    function validAmount(cents) {
      if (!Number.isSafeInteger(cents) || cents <= 0 || cents > 1000000) throw new Error("Informe um valor válido.");
    }
    function post(data) {
      validAmount(data.amountCents);
      if (data.direction === "out" && data.amountCents > bank.balanceCents) throw new Error("Saldo insuficiente. Escolha um valor menor.");
      const transaction = { ...data, id: `UNAPI-${now.getFullYear()}-${String(++serial).padStart(6, "0")}`, date: new Date().toISOString() };
      bank.balanceCents += (data.direction === "in" ? 1 : -1) * data.amountCents;
      bank.transactions.unshift(transaction);
      return { ...transaction };
    }
    return Object.freeze({
      snapshot() {
        return { ...bank, card: { ...bank.card }, paidBills: [...bank.paidBills], transactions: bank.transactions.map(item => ({ ...item })) };
      },
      toggleBalance() { bank.hiddenBalance = !bank.hiddenBalance; },
      payPix(contactId, amountCents, source = "Chave Pix") {
        if (!Object.hasOwn(contacts, contactId)) throw new Error("Destinatário não encontrado.");
        const person = contacts[contactId];
        return post({ amountCents, direction: "out", kind: "pix", name: person.name, documentLabel: person.documentLabel, document: person.document, key: person.key, description: "Pix enviado", source });
      },
      payBill(id) {
        const bill = bills.find(item => item.id === id);
        if (!bill || bank.paidBills.includes(id)) throw new Error("Esta conta já foi paga ou não está disponível.");
        const transaction = post({ amountCents: bill.amountCents, direction: "out", kind: "payment", name: bill.company, documentLabel: "CNPJ", document: bill.document, description: bill.name, source: "Pagamento de conta" });
        bank.paidBills.push(id);
        return transaction;
      },
      payInvoice() {
        if (!bank.card.invoiceCents) throw new Error("Sua fatura já está paga.");
        const transaction = post({ amountCents: bank.card.invoiceCents, direction: "out", kind: "invoice", name: "Cartão UnAPI · final 2026", documentLabel: "Instituição", document: "Banco UnAPI", description: "Pagamento da fatura", source: "Saldo em conta" });
        bank.card.invoiceCents = 0;
        return transaction;
      },
      toggleCard(field) {
        if (!["locked", "online", "contactless", "virtualLocked"].includes(field)) return;
        bank.card[field] = !bank.card[field];
      },
      createVirtualCard() { bank.card.virtual = true; },
      setLimit(cents) {
        if (![50000, 100000, 200000, 300000].includes(cents) || cents < bank.card.invoiceCents) throw new Error("O limite deve cobrir a fatura atual.");
        bank.card.limitCents = cents;
      },
      moveReserve(cents, direction) {
        validAmount(cents);
        if (!["save", "withdraw"].includes(direction)) throw new Error("Operação não disponível.");
        if (direction === "withdraw" && cents > bank.reserveCents) throw new Error("O valor é maior que o disponível na reserva.");
        const transaction = post({ amountCents: cents, direction: direction === "withdraw" ? "in" : "out", kind: "reserve", name: "Minha reserva", description: direction === "withdraw" ? "Resgate da reserva" : "Valor guardado", documentLabel: "Titular", document: contacts.own.name, source: "Transferência entre saldos" });
        bank.reserveCents += direction === "withdraw" ? -cents : cents;
        return transaction;
      },
      receive(cents) {
        return post({ amountCents: cents, direction: "in", kind: "income", name: "João Batista de Oliveira", description: "Pix recebido", documentLabel: "CPF", document: "***.321.654-**", source: "Pix" });
      },
    });
  }
  window.BancoUnapi = Object.freeze({ contacts, bills, parseMoney, createAccount });
})();
