import Permissions from "../components/Permissions";
import PleaseSignIn from "../components/PleaseSignIn";

const PermissionsPage = props => (
  <div>
    <p>permissions</p>
    <PleaseSignIn>
      <Permissions />
    </PleaseSignIn>
  </div>
);

export default PermissionsPage;
