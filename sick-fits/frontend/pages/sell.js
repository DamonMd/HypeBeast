import CreateItem from "../components/CreateItem";
import PleaseSignIn from "../components/PleaseSignIn";

const Sell = props => (
  <div>
    <p>sell</p>
    <PleaseSignIn>
      <CreateItem />
    </PleaseSignIn>
  </div>
);

export default Sell;
