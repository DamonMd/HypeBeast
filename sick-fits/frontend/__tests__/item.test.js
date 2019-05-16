import ItemComponent from "../components/Item";
import { shallow } from "enzyme";
import toJSON from "enzyme-to-json";

const fakeItem = {
  id: "ABC123",
  title: "a cool thingy",
  price: 4000,
  description: "this item is really cool?",
  image: "dog.jpg",
  largeImage: "largedog.jpg"
};

describe("<Item/>", () => {
  it("renders and matches the snapshot", () => {
    const wrapper = shallow(<ItemComponent item={fakeItem} />);
    expect(toJSON(wrapper)).toMatchSnapshot();
  });

  // it("renders the price tag and title", () => {
  //   const wrapper = shallow(<ItemComponent item={fakeItem} />);
  //   const PriceTag = wrapper.find("PriceTag");
  //   console.log(wrapper.debug());
  //   expect(PriceTag.children().text()).toBe("$50");
  //   expect(wrapper.find("Title a").text()).toBe(fakeItem.title);
  // });

  // it("renders the image properly", () => {
  //   const wrapper = shallow(<ItemComponent item={fakeItem} />);
  //   const img = wrapper.find("img");
  //   expect(img.props().src).toBe(fakeItem.image);
  //   expect(img.props().alt).toBe(fakeItem.title);
  // });

  // it("renders out the buttons properly", () => {
  //   const wrapper = shallow(<ItemComponent item={fakeItem} />);
  //   const buttonList = wrapper.find(".buttonList");
  //   expect(buttonList.children()).toHaveLength(3);
  //   expect(buttonList.find("Link")).toHaveLength(1);
  //   expect(buttonList.find("Link")).toBeTruthy();
  //   expect(buttonList.find("Link").exists()).toBe(true);
  //   expect(buttonList.find("AddToCart").exists()).toBe(true);
  //   expect(buttonList.find("DeleteItem").exists()).toBe(true);
  // });
});
