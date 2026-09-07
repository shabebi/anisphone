import { Link, Route, Routes } from 'react-router-dom';

function Home() {
  return (
    <main className="page">
      <p className="eyebrow">ANIS PHONE</p>
      <h1>Foundation is ready.</h1>
      <p>Customer website foundation.</p>
      <Link to="/products">Products</Link>
    </main>
  );
}

function Products() {
  return (
    <main className="page">
      <h1>Products</h1>
      <p>Product listing will be built here.</p>
      <Link to="/">Back home</Link>
    </main>
  );
}

function NotFound() {
  return (
    <main className="page">
      <h1>404</h1>
      <Link to="/">Go home</Link>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
