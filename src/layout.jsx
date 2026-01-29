const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <main className="w-full max-w-[600px] bg-white min-h-screen px-4">
        {children}
      </main>
    </div>
  )
}

export default Layout
