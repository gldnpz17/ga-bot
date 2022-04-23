const LoginPage = () => {
  const handleSubmit = async (event) => {
    event.preventDefault()

    const { key } = event.target

    const response = await fetch({
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: key.value
      })
    })

    if (response.status === 200) alert("Login successful")

    event.target.reset()
  }

  return (
    <div className="h-screen flex justify-center items-center">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center">
        <div className="text-white">
          <label>Enter Key: <input name="key" className="text-black" /></label>
        </div>
        <button type="submit" className="bg-white px-4 py-2 border-slate-600 border-2 rounded-md">Login</button>
      </form>
    </div>
  )
}

export default LoginPage