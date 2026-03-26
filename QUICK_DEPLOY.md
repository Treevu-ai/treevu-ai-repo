# 🚀 Desplegar Treevú a Producción

## Opción 1: Auto-Deploy con GitHub (RECOMENDADO)

Tu proyecto está conectado a GitHub. Los cambios se despliegan automáticamente:

1. **En v0**: Click en Settings → Git
2. **Confirma cambios**: Verifica que veas los cambios pendientes
3. **Push a GitHub**: 
   - Rama actual: `continue-development`
   - El sistema automáticamente hace push
4. **Vercel despliega**: En 2-3 minutos el sitio estará actualizado

## Opción 2: Desplegar Manualmente en Vercel

Si prefieres control total:

1. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto: **treevu-ai-repo**
3. Click en "Deployments" → Botón "Deploy"
4. Espera a que compile (3-5 minutos)

## Opción 3: Desplegar desde CLI

```bash
# Clone el repo
git clone https://github.com/Treevu-ai/treevu-ai-repo.git
cd treevu-ai-repo

# Instala dependencias
npm install

# Verifica que funcione localmente
npm run dev

# Deploy a Vercel
npm install -g vercel
vercel
```

## ✅ Verificar Despliegue

Después del deploy:

1. **Visita tu sitio**:
   - Staging: https://treevu-ai-repo-staging.vercel.app
   - Producción: https://treevu-ai-repo.vercel.app (depende de tu configuración)

2. **Prueba el flujo completo**:
   - Landing page (/) → Se ve como PWA
   - Regístrate → Ir a dashboard
   - Solicitar adelanto → Completar formulario
   - Historial → Ver transacciones

3. **Checks**:
   - PWA instalable en móvil
   - Navegación inferior funciona
   - Logout en perfil funciona

## 🐛 Si hay errores

Checks en Build Logs:
1. Ve a Vercel → Deployments → Tu último deploy
2. Click en "Build Logs"
3. Busca errores de TypeScript o módulos faltantes
4. Compartir error conmigo para fix

## 📱 Instalación PWA

En móvil (Chrome/Safari):
1. Abre la app
2. Click en "Instalar" o "Add to Home Screen"
3. Aparecerá como app nativa con icon de Treevü

---

**Recomendación**: Usa la **Opción 1** (Git) para que los cambios se desplieguen automáticamente cada vez que los guardes en v0.
