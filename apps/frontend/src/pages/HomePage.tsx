import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div>
      <h2>Welcome to SafeBash</h2>
      <p>
        Analyze and verify bash scripts before running them with <code>curl | sh</code>
      </p>
      <Link to="/analyze">
        <button>Analyze a Script</button>
      </Link>
    </div>
  );
}

export default HomePage;
