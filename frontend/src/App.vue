<template>
  <div class="drawer lg:drawer-open bg-slate-50 min-h-screen">
    <input id="my-drawer-3" type="checkbox" class="drawer-toggle" />
    
    <div class="drawer-content flex flex-col">
      <main class="flex-grow pb-24 lg:pb-0">
        <RouterView />
      </main>

      <div class="lg:hidden fixed bottom-4 left-4 right-4 z-50">
        <nav class="bg-white/80 backdrop-blur-lg border border-slate-100 rounded-3xl shadow-2xl px-8 py-4 flex justify-between items-center">
          <RouterLink to="/" class="mobile-nav-link">
            <img src="./assets/home.png" alt="Home" class="w-6 h-6 object-contain">
          </RouterLink>
          <RouterLink to="/recipes" class="mobile-nav-link">
            <img src="./assets/list.png" alt="Rezepte" class="w-6 h-6 object-contain">
          </RouterLink>
          <RouterLink to="/calendar" class="mobile-nav-link">
            <img src="./assets/calendar.png" alt="Plan" class="w-6 h-6 object-contain">
          </RouterLink>
          <RouterLink to="/shoppinglist" class="mobile-nav-link">
            <img src="./assets/bag.png" alt="Einkauf" class="w-6 h-6 object-contain">
          </RouterLink>
        </nav>
      </div>
    </div>

    <div class="drawer-side z-40">
      <label for="my-drawer-3" aria-label="close sidebar" class="drawer-overlay"></label>
      <div class="menu bg-white min-h-[calc(100%-40px)] w-24 m-5 rounded-[30px] shadow-sm flex flex-col justify-between py-10 items-center border border-slate-50">
        
        <img src="./assets/Logo.png" alt="ToVan Logo" class="w-12 h-auto">
        
        <div class="flex flex-col gap-10">
          <RouterLink to="/" class="sidebar-link">
            <img src="./assets/home.png" alt="Home" class="w-5">
          </RouterLink>
          <RouterLink to="/recipes" class="sidebar-link">
            <img src="./assets/list.png" alt="Rezepte" class="w-5">
          </RouterLink>
          <RouterLink to="/calendar" class="sidebar-link">
            <img src="./assets/calendar.png" alt="Wochenplan" class="w-5">
          </RouterLink>
          <RouterLink to="/shoppinglist" class="sidebar-link">
            <img src="./assets/bag.png" alt="Einkaufsliste" class="w-6">
          </RouterLink>
        </div>

        <div class="w-10 h-10 rounded-full bg-slate-100"></div> </div>
    </div>
  </div>
</template>

<style scoped>
.router-link-active {
  position: relative;
}

.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
}

.sidebar-link, .mobile-nav-link {
  @apply transition-transform duration-200 hover:scale-110 active:scale-95 flex justify-center items-center;
}

.drawer-side {
  max-width: 140px;
}

.drawer-button {
  display: none;
}
</style>