const UserInfo = ({ user }) => {
  return <>
    <table className="w-full">
      <tbody>
        <tr className="border-b">
          <td width="15%" className="py-2 pr-4 whitespace-nowrap">Nama Lengkap:</td>
          <td className="py-2 font-bold">{user.fullname}</td>
        </tr>
        <tr className="border-b">
          <td width="15%" className="py-2 pr-4 whitespace-nowrap">Jenis Kelamin:</td>
          <td className="py-2 font-bold">{user.gender}</td>
        </tr>
        <tr className="border-b">
          <td width="15%" className="py-2 pr-4 whitespace-nowrap">NIP / Nomor:</td>
          <td className="py-2 font-bold">{user.nip}</td>
        </tr>
        <tr className="border-b">
          <td width="15%" className="py-2 pr-4 whitespace-nowrap">Posisi / Jabatan:</td>
          <td className="py-2 font-bold">{user.position}</td>
        </tr>
        <tr className="border-b">
          <td width="15%" className="py-2 pr-4 whitespace-nowrap">Email:</td>
          <td className="py-2 font-bold">{user.email}</td>
        </tr>
      </tbody>
    </table>
  </>
}

export default UserInfo
