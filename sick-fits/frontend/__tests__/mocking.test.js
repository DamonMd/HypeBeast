function Person(name, foods) {
  this.name = name;
  this.foods = foods;
}

Person.prototype.fetchFoods = function() {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(this.foods), 2000);
  });
};

describe("mock learing", () => {
  it("can create a person", () => {
    const me = new Person("dEnergy", ["taco", "burrito"]);
    expect(me.name).toBe("dEnergy");
  });

  it("can fetch foods", async () => {
    const me = new Person("d", ["za", "dawgs"]);
    me.fetchFoods = jest.fn().mockResolvedValue(["sushi", "pie"]);
    const foods = await me.fetchFoods();
    expect(foods).toContain("sushi");
  });
});
