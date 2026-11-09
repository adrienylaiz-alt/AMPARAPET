// Único lugar com o endereço da API.
// Para apontar para outro servidor, defina window.AMPARAPET_API_URL em um <script>
// antes dos módulos (ou altere o valor padrão abaixo).
export const API_URL = (window.AMPARAPET_API_URL || "amparapet-production.up.railway.app").replace(/\/+$/, "");

// Limites das fotos aceitos pela API (backend/app/config.py e routers/admin.py)
export const FOTO_MAX_MB = 5;
export const FOTO_MAX_POR_ANIMAL = 20;
export const FOTO_TIPOS = ["image/jpeg", "image/png", "image/webp"];
