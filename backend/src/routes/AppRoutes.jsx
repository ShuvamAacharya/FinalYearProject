<Route element={<MainLayout />}>
  <Route path="/" element={<Home />} />
  {/* Login and Register can also use MainLayout or switch to AuthLayout later */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/dashboard" element={<Dashboard />} />

</Route>
