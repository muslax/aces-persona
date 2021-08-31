import Timer from "./Timer"

const Timeout = ({ time, callback }) => {

  return <>
    <h1 className="text-center font-bold">Timeout</h1>
    <Timer
      remaining={time}
      onTimeout={callback}
      showTimer={false}
    />
  </>
}

export default Timeout
