import React, { useState, useEffect } from "react";
import "./App.css";

/* 
 Etiquetas que se muestran de forma rapida en la pantalla principal 
*/
const tags = [
  "Podcasts",
  "Triste",
  "Viaje diario",
  "Energía",
  "Relajación",
  "Para sentirte bien",
  "Fiesta",
  "Romance",
  "Entrenamiento",
  "Concentración",
  "Sueño",
];

/* 
  Arreglo de nombres de playlists utilizadas

*/
const forgotten = [
  "Gym",
  "Fiesta Latina",
  "Favoritos",
  "Clásicos",
  "Descubrimientos",
  "Viejos tiempos",
];

/* Pantalla de login */
/* 
  Componente de pantalla de inicio de sesión.
  Recibe la función onLogin para establecer el usuario en el componente principal.
*/
function LoginScreen({ onLogin }) {
  //  para almacenar el correo que ingresa el usuario
  const [email, setEmail] = useState("");
  //  para indicar si se está realizando la petición al backend
  const [loading, setLoading] = useState(false);
  //  muestra mensajes de error de validación o del servidor
  const [error, setError] = useState("");

  /* 
    Maneja el envío del formulario de login.
  */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validación básica de que el campo email no venga vacío
    if (email.trim() === "") {
      setError("Escribe un correo electrónico.");
      return;
    }

    setLoading(true);
    try {
      // Petición POST al backend usando el endpoint de login
      const res = await fetch(
        "http://localhost/music-api/index.php?action=login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      // Si el servidor responde con error, se muestra el mensaje
      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión");
      } else {
        // data se espera con forma { id, email, created_at, last_login }
        onLogin(data);
      }
    } catch (err) {
      // Manejo de errores de conexión o excepciones
      console.error(err);
      setError("No se pudo conectar con el servidor.");
    } finally {
      // Se desactiva estado de carga al finalizar
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo y título de la pantalla de login */}
        <div className="login-logo">G</div>
        <h1 className="login-title">Accede a tu cuenta</h1>
        <p className="login-subtitle">
          {/* Texto opcional de subtítulo (actualmente vacío) */}
        </p>

        {/* Formulario principal de login */}
        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label">Correo electrónico o teléfono</label>
          <input
            className="login-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.com"
          />

          {/* Mensaje de error en caso de validación o fallos de servidor */}
          {error && (
            <p style={{ color: "red", fontSize: "0.9rem", marginTop: "0.5rem" }}>
              {error}
            </p>
          )}

          {/* Enlace auxiliar para recuperar correo */}
          <div className="login-links">
            <button type="button" className="login-link-button">
              ¿Olvidaste el correo electrónico?
            </button>
          </div>

          {/* Texto extra/ayuda (actualmente sin contenido visible) */}
          <p className="login-extra">
            {" "}
            <span className="login-link">
              {/* Aquí se puede colocar algún texto informativo */}
            </span>
          </p>

          {/* Acciones finales del formulario (botón principal “Siguiente”) */}
          <div className="login-actions">
            <button type="button" className="login-text-button">
              {/* Botón de texto opcional (actualmente vacío) */}
            </button>
            <button type="submit" className="login-main-button" disabled={loading}>
              {loading ? "Entrando..." : "Siguiente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/*App principal
  Compone principalmente la aplicación de música.
  Maneja el estado de autenticación, canciones, reproducto.
*/
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [favIndex, setFavIndex] = useState(0);
  const [quickSongs, setQuickSongs] = useState([]);
  const [queueSongs, setQueueSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resQuick = await fetch(
          "http://localhost/music-api/index.php?action=quickSongs"
        );
        const dataQuick = await resQuick.json();
        setQuickSongs(Array.isArray(dataQuick) ? dataQuick : []);
        const resQueue = await fetch(
          "http://localhost/music-api/index.php?action=queueSongs"
        );
        const dataQueue = await resQueue.json();
        setQueueSongs(Array.isArray(dataQueue) ? dataQueue : []);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Error al cargar canciones desde el servidor");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleSelectSong = (song) => {
    setCurrentSong(song);
  };

  /* 
    Regresa a la pantalla principal (home).
    
  */
  const handleBackHome = () => {
    setCurrentSong(null);
  };

  /* 
    Cierra la sesión del usuario.
    
  */
  const handleLogout = () => {
    setShowProfileMenu(false);
    setCurrentSong(null);
    setIsLoggedIn(false);
    setUser(null);
  };

  /* 
    Avanza el índice del carrusel de "Favoritos olvidados" hacia adelante.
  */
  const handleNextFav = () => {
    setFavIndex((prev) => (prev + 1) % forgotten.length);
  };

  /* 
    Retrocede el índice del carrusel de "Favoritos olvidados".
  */
  const handlePrevFav = () => {
    setFavIndex((prev) => (prev - 1 + forgotten.length) % forgotten.length);
  };

  /* 
    Si el usuario NO está logueado, se muestra únicamente la pantalla de Login.
  */
  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  /* 
    Si el usuario está sin hacer nada, se muestra la aplicación completa
  */
  return (
    <div className="app">
      
      <aside className="sidebar">
        <div className="sidebar-logo">🎵 Music</div>
        <nav className="sidebar-menu">
          <button className="sidebar-item active" onClick={handleBackHome}>
            Principal
          </button>
          <button className="sidebar-item">Explorar</button>
          <button className="sidebar-item">Biblioteca</button>
          <button className="sidebar-item">Actualizar</button>
        </nav>

        <button className="sidebar-button">+ Nueva playlist</button>

        <div className="sidebar-section">
          <p className="sidebar-section-title">Música que te gustó</p>
          <p className="sidebar-section-item">Playlist autogenerada</p>
        </div>

        <div className="sidebar-section">
          <p className="sidebar-section-title">Playlists</p>
          <p className="sidebar-section-item">Gym</p>
          <p className="sidebar-section-item">Fiesta Latina</p>
          <p className="sidebar-section-item">Rolitas</p>
        </div>
      </aside>

      <main className="main">

        <header className="top-bar">
          <input
            className="search"
            placeholder="Buscar canciones, álbumes, artistas o podcasts"
          />

          <div
            className="profile"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="profile-avatar">
              {user?.email ? user.email[0].toUpperCase() : "U"}
            </div>

            {showProfileMenu && (
              <div
                className="profile-menu"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="profile-user">
                  <div className="profile-avatar big">
                    {user?.email ? user.email[0].toUpperCase() : "U"}
                  </div>
                  <div>
                    <p className="profile-name">
                      {user?.email || "Usuario sin nombre"}
                    </p>
                    <p className="profile-email">{user?.email}</p>
                    <button className="profile-manage">
                    </button>
                  </div>
                </div>

                <div className="profile-divider" />

                <button className="profile-item" onClick={handleLogout}>
                  Salir
                </button>

                <div className="profile-divider" />

                <button className="profile-item">Configuración</button>
              </div>
            )}
          </div>
        </header>

        {loading && <p style={{ padding: "1rem" }}>Cargando canciones...</p>}
        {error && <p style={{ padding: "1rem", color: "red" }}>{error}</p>}

        {!currentSong && !loading && (
          <>
            <div className="chips">
              {tags.map((tag) => (
                <button key={tag} className="chip">
                  {tag}
                </button>
              ))}
            </div>

            <section className="section">
              <div className="section-header">
                <h2>Selección rápida</h2>
                <button className="play-all">Reproducir todo</button>
              </div>

              <div className="quick-list">
                {quickSongs.map((song) => (
                  <div
                    key={song.id}
                    className="song-row"
                    onClick={() => handleSelectSong(song)}
                  >
                    <div className="song-left">
                      <div className="song-cover" />
                      <div>
                        <p className="song-title">{song.title}</p>
                        <p className="song-sub">
                          {song.artist} · {song.info}
                        </p>
                      </div>
                    </div>
                    <div className="song-actions">
                      <span>❤</span>
                      <span>⋮</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="section">
              <h2>Favoritos olvidados</h2>

              <div className="favorites-carousel">
                <button className="favorite-arrow" onClick={handlePrevFav}>
                  ‹
                </button>

                <div className="favorites-window">
                  {Array.from({ length: 4 }).map((_, i) => {
                    const index = (favIndex + i) % forgotten.length;
                    const name = forgotten[index];
                    return (
                      <div key={index} className="favorite-card">
                        <div className="favorite-cover" />
                        <p className="favorite-title">{name}</p>
                      </div>
                    );
                  })}
                </div>

                <button className="favorite-arrow" onClick={handleNextFav}>
                  ›
                </button>
              </div>
            </section>
          </>
        )}

/* VISTA DE REPRODUCCIÓN  */
        {currentSong && (
          <div className="player-layout">
            {/* Columna central con portada grande y datos de la canción */}
            <div className="player-center">
              {/* Botón para regresar a la pantalla principal */}
              <button className="back-button" onClick={handleBackHome}>
                ⬅ Volver
              </button>

              {/* Portada grande del álbum/canción (estilizada por CSS) */}
              <div className="player-cover-large">
                <div className="player-cover-eye" />
              </div>

              {/* Información principal de la canción actualmente seleccionada */}
              <div className="player-main-meta">
                <p className="player-main-title">{currentSong.title}</p>
                <p className="player-main-sub">
                  {currentSong.artist}
                  {currentSong.info ? ` · ${currentSong.info}` : ""}
                </p>
              </div>
            </div>

            {/* Columna derecha con la lista de reproducción "A CONTINUACIÓN" */}
            <aside className="player-right">
              <div className="player-right-header">
                <h3>A CONTINUACIÓN</h3>
              </div>

              {/* Descripción de origen de la cola (radio basada en la canción actual) */}
              <p className="player-right-sub">
                Reproduciendo desde <strong>Radio de {currentSong.title}</strong>
              </p>

              {/* Filtros visuales para la lista de la derecha (sin lógica aún) */}
              <div className="player-right-filters">
                <button className="player-filter active">All</button>
                <button className="player-filter">Canciones conocidas</button>
                <button className="player-filter">Canciones por descubrir</button>
              </div>

              {/* Lista de la cola de canciones; permite seleccionar otra canción */}
              <div className="queue-list">
                {queueSongs.map((song) => (
                  <div
                    key={song.id}
                    className={
                      "queue-row" +
                      (song.title === currentSong?.title ? " selected" : "")
                    }
                    onClick={() => handleSelectSong(song)}
                  >
                    <div className="queue-left">
                      {/* Icono de reproducción solo en la canción actual */}
                      <div className="queue-icon">
                        {song.title === currentSong?.title ? "▶" : ""}
                      </div>
                      <div>
                        <p className="queue-title">{song.title}</p>
                        <p className="queue-sub">{song.artist}</p>
                      </div>
                    </div>
                    {/* Duración de la canción mostrada al lado derecho */}
                    <span className="queue-duration">{song.duration}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* Barra inferior del reproductor, visible solo si hay canción seleccionada */}
      {currentSong && (
        <div className="bottom-player">
          {/* Sección izquierda con miniatura e información básica de la canción */}
          <div className="bottom-left">
            <div className="bottom-cover" />
            <div>
              <p className="bottom-title">{currentSong.title}</p>
              <p className="bottom-sub">{currentSong.artist}</p>
            </div>
          </div>

          {/* Controles de reproducción (play, anterior, siguiente) y barra de progreso */}
          <div className="bottom-center">
            <div className="bottom-controls">
              <button>⏮</button>
              <button className="play-btn">▶</button>
              <button>⏭</button>
            </div>
            <div className="bottom-progress">
              {/* Tiempo actual (fijo como ejemplo) */}
              <span>0:02</span>
              {/* Barra de progreso visual (sin lógica real de tiempo) */}
              <div className="bottom-bar">
                <div className="bottom-bar-fill" />
              </div>
              {/* Duración total de la canción o valor por defecto */}
              <span>{currentSong.duration || "3:00"}</span>
            </div>
          </div>

          {/* Sección derecha con ícono de volumen (sin lógica aún) */}
          <div className="bottom-right">
            <button>🔊</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;



