<template>
  <!--<header>
    <nav>
      <RouterLink to="/">Rezepte</RouterLink> |
      <RouterLink to="/calendar">Wochenplan</RouterLink> |
      <RouterLink to="/shoppinglist">Shoppinglist</RouterLink>
    </nav>
  </header>-->
  
  <div class="drawer lg:drawer-open">
    <input id="my-drawer-3" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content flex flex-col items-center justify-start">
      <!-- Page content here -->
      <label for="my-drawer-3" class="btn drawer-button lg:hidden">
        Open drawer
      </label>
      <RouterView />
    </div>
    <div class="drawer-side">
      <label for="my-drawer-3" aria-label="close sidebar" class="drawer-overlay"></label>
      <ul class="menu bg-base-200 min-h-full w-80 p-4" style="background-color: white; display: flex; align-items: center; justify-content: center; gap: 30px;">
        <!-- Sidebar content here -->
        <li><RouterLink to="/" class="flex justify-center"><img src="./assets/recipe-book.png" alt="Rezepte" class="w-[35px]"></RouterLink></li>
        <li><RouterLink to="/calendar" class="flex justify-center"><img src="./assets/schedule.png" alt="Wochenplan" class="w-[32px]"></RouterLink></li>
        <li><RouterLink to="/shoppinglist" class="flex justify-center"><img src="./assets/clipboard.png" alt="Einkaufsliste" class="w-[30px]"></RouterLink></li>
      </ul>
    </div>
  </div>
</template>

<style>
nav { padding: 20px; background: #f4f4f4; margin-bottom: 20px; }
nav a { text-decoration: none; color: #333; font-weight: bold; }
nav a.router-link-active { color: #42b983; } /* Aktiver Link wird grün */

.drawer-side {
  max-width: 100px;
}

.menu {
  width: auto;
}
</style>