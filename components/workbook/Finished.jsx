import Timer from "./Timer"

const Finished = ({ time, callback }) => {

  return <>
    <h1 className="text-center font-bold">Anda sudah selesai mengerjakan tes ini.</h1>
    <Timer
      remaining={time}
      onTimeout={callback}
      showTimer={false}
    />
  </>
}

export default Finished
