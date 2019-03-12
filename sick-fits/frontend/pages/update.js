import UpdateItem from "../components/UpdateItem";

const Update = ({ query }) => (
  <div>
    <p>sell</p>
    <UpdateItem id={query.item} />
  </div>
);

export default Update;
