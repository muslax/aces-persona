import Timer from "./Timer"

const Continue = ({ time, continueTest, closeTest }) => {

  return <>
    <h1 className="text-center font-bold">Anda sedang dalam sesi mengerjakan tes.</h1>
    <Timer
      remaining={time}
      onTimeout={continueTest}
      showTimer={true}
    />
    <button
      className="border px-4 py-1 mr-4"
      onClick={continueTest}
    >Continue Test</button>
  </>
}

export default Continue
