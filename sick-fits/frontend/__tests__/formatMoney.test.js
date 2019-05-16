import formatMoney from "../lib/formatMoney";

describe("formatMoney function", () => {
  it("works with fractional dollars", () => {
    expect(formatMoney(1)).toEqual("$0.01");
    expect(formatMoney(90)).toEqual("$0.90");
  });

  it("leaves cents off for whole dollars", () => {
    expect(formatMoney(100)).toEqual("$1");
    expect(formatMoney(5000)).toEqual("$50");
  });

  it("works with whole and fractional dollars", () => {
    expect(formatMoney(5012)).toEqual("$50.12");
    expect(formatMoney(116)).toEqual("$1.16");
  });
});
