import ItemPresenter from "faktura/presenters/item";

var InvoicePresenter = Ember.ObjectProxy.extend({
    model: Ember.computed.alias("content"),

    items: Ember.computed.map("model.items", function (item) {
        return ItemPresenter.create({ model: item });
    }),

    netAmounts: Ember.computed.mapBy("items", "netAmount"),
    totalNetAmount: Ember.computed.sum("netAmounts"),

    taxAmounts: Ember.computed.mapBy("items", "taxAmount"),
    totalTaxAmount: Ember.computed.sum("taxAmounts"),

    grossAmounts: Ember.computed.mapBy("items", "grossAmount"),
    totalGrossAmount: Ember.computed.sum("grossAmounts"),

    subTotals: function () {
        return this.get("items").mapBy("formattedTaxRate").uniq().map(function (formattedTaxRate) {
            var items,
                result = Ember.Object.create({ formattedTaxRate: formattedTaxRate });

            items = this.get("items").filterBy("formattedTaxRate", formattedTaxRate);

            result.netAmount = items.reduce(function (previousValue, item) {
                return previousValue + item.get("netAmount");
            }, 0);

            result.taxAmount = items.reduce(function (previousValue, item) {
                return previousValue + item.get("taxAmount");
            }, 0);

            result.grossAmount = items.reduce(function (previousValue, item) {
                return previousValue + item.get("grossAmount");
            }, 0);

            return result;
        }.bind(this));
    }.property("items", "items.@each.netAmount", "items.@each.taxAmount", "items.@each.grossAmount", "items.@each.formattedTaxRate"),

    sellerFirstLine: function () {
        return this.get("seller").split("\n")[0];
    }.property("seller"),

    sellerRest: function () {
        return this.get("seller").split("\n").slice(1);
    }.property("seller"),

    buyerFirstLine: function () {
        return this.get("buyer").split("\n")[0];
    }.property("buyer"),

    buyerRest: function () {
        return this.get("buyer").split("\n").slice(1);
    }.property("buyer"),

    commentLines: function () {
        return this.get("comment").split("\n");
    }.property("comment"),

    totalGrossAmountInWords: function () {
        var dollars, cents,
            amount = String(this.get("totalGrossAmount"));

        dollars = amount.substr(0, amount.length - 2);
        cents = amount.substr(amount.length - 2, amount.length);

        if (dollars.length > 0) {
            return window.polishToWords(dollars) + " " + this.get("currency.code") + " " + cents + "/100";
        } else {
            return "";
        }
    }.property("totalGrossAmount", "currency.code"),

    englishTotalGrossAmountInWords: function () {
        var dollars, cents,
            amount = String(this.get("totalGrossAmount"));

        dollars = amount.substr(0, amount.length - 2);
        cents = amount.substr(amount.length - 2, amount.length);

        if (dollars.length > 0) {
            return window.toWords(dollars) + " " + this.get("currency") + " " + cents + "/100";
        } else {
            return "";
        }
    }.property("totalGrossAmount", "currency"),

    isEnglish: function () {
        return this.get("languageCode") === "plen";
    }.property("languageCode")
});

export default InvoicePresenter;