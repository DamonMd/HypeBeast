import SingleItem from "../components/SingleItem";

const Item = props => (
  <div>
    <p>single item</p>
    <SingleItem id={props.query.item} />
  </div>
);

export default Item;
