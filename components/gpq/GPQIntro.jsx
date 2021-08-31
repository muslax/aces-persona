export default function GPQIntro({ session, startTest, closeTest }) {
  return <>
    <h1 className="font-bold mb-5">GPQ Inroduction - Session {session}</h1>

    <div className="buttons">
      <button
        className="border px-4 py-1 mr-4"
        onClick={startTest}
      >Start Test</button>
      <button
        className="border px-4 py-1 mr-4"
        onClick={closeTest}
      >Cancel Test</button>
    </div>
  </>
}