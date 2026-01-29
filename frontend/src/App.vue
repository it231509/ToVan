<template>
  <header>
    <nav>
      <RouterLink to="/">Rezepte</RouterLink> |
      <RouterLink to="/calendar">Wochenplan</RouterLink> |
      <RouterLink to="/shoppinglist">Shoppinglist</RouterLink>
    </nav>
  </header>

  <RouterView />
</template>

<style>
nav { padding: 20px; background: #f4f4f4; margin-bottom: 20px; }
nav a { text-decoration: none; color: #333; font-weight: bold; }
nav a.router-link-active { color: #42b983; } /* Aktiver Link wird grün */
</style>