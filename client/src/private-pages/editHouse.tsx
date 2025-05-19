import { Link, useParams } from 'react-router-dom';
import appLogo from '../assets/App Logo.svg';
import '../App.css';

const EditHouse = () => {
  const { houseName } = useParams<{ houseName: string }>();
  const decodedHouseName = decodeURIComponent(houseName || '');

  return (
    <div
      className="container grid bg-white rounded-[30px]">
        <div className='logo-container'>
            <div className="app-logo">
            <Link to="/">
                <img src={appLogo} className="logo" alt="Chorepad Logo" />
            </Link>
            </div>
            <div className="app-text">
                <h1>
                    Chorepad
                </h1>
            </div>     
        </div>
        <div>
            <h1>Editing: {decodedHouseName}</h1>
            {/* Edit form */}
        </div>
        <div>
            <h1>
                bruh
            </h1>
        </div>
    </div>
  );
}

export default EditHouse;