Faktura.IndexController = Ember.ObjectController.extend({
    dateOfIssueDidChange: function () {
        var dateOfIssue = this.get("dateOfIssue");

        if (dateOfIssue) {
            this.set("isLoadingExchangeRate", true);
            nbpDaily({ date: new Date(Date.parse(dateOfIssue) - 24 * 60 * 60 * 1000) })
                .done(function (result) {
                    this.set("exchangeRates", result);
                }.bind(this))
                .always(function () {
                    this.set("isLoadingExchangeRate", false);
                }.bind(this));
        }
    }.observes("dateOfIssue"),

    isUsingExchangeRate: function () {
        return this.get("currency") !== "PLN" && this.get("totalTaxAmount") !== 0;
    }.property("currency", "totalTaxAmount"),

    exchangeRate: function () {
        var exchangeRates = this.get("exchangeRates");

        if (exchangeRates) {
            return exchangeRates.pozycja.findBy("kod_waluty", this.get("currency"));
        }
    }.property("exchangeRates", "currency"),

    exchangeAverage: function () {
        var integerPart, fractionalPart,
            exchangeRate = this.get("exchangeRate");

        if (exchangeRate) {
            integerPart = exchangeRate.kurs_sredni.split(",")[0];
            fractionalPart = exchangeRate.kurs_sredni.split(",")[1];
            return parseInt(integerPart + (fractionalPart + "0000").substr(0, 4), 10);
        }
    }.property("exchangeRate"),

    exchangeDivisor: function () {
        var exchangeRate = this.get("exchangeRate");

        if (exchangeRate) {
            return parseInt(exchangeRate.przelicznik, 10);
        }
    }.property("exchangeRate"),

    exchangeDate: function () {
        var exchangeRate = this.get("exchangeRate"),
            exchangeRates = this.get("exchangeRates");

        if (exchangeRates && exchangeRate) {
            return exchangeRates.data_publikacji;
        }
    }.property("exchangeRates", "exchangeRate"),

    subTotalsPLN: function () {
        return this.get("subTotals").map(function (subTotal) {
            return Ember.Object.create({
                formattedTaxRate: subTotal.taxRate,
                netAmount: subTotal.netAmount,
                taxAmount: subTotal.taxAmount,
                grossAmount: subTotal.grossAmount,
                taxAmountPLN: Math.round(subTotal.taxAmount * this.get("exchangeAverage") / (this.get("exchangeDivisor") * 10000))
            });
        }.bind(this));
    }.property("subTotals", "exchangeAverage", "exchangeDivisor"),

    actions: {
        removeItem: function (item) {
            this.get("model.items").removeObject(item);
        },
        addItem: function () {
            this.get("model.items").pushObject(Faktura.Item.create());
        },
        setLanguage: function (language) {
            this.set("model.language", language);
        },
        setCurrency: function (currency) {
            this.set("model.currency", currency);
        },
        print: function () {
            window.print();
        },
        save: function () {
            this.transitionToRoute("index", this.get("model").toString());
        }
    }
});
