export default function TestLayout({ children }) {
  return (
    <div id="test-layout" className="bg-yellow-50 bg-gradient-to-t from-white">
      <div className="min-h-screen">
        {children}
      </div>
    </div>
  );
}
