import '../styles/Home.css';

export function Home() {
  return (
    <section className="Home">
      <div className='Home-content'>
        <h1>FitSync el mejor GYM <br />para entrenar</h1>

        <p>Deja atrás el entrenamiento promedio. FitSync es el santuario de los verdaderos competidores.
           Accede a equipos de élite, programación de fuerza avanzada y la comunidad que exige lo mejor de ti.
            Tu próxima marca personal se construye aquí..</p>

        <a href="/register">
          <button type="button">Unete Ahora</button>
        </a>
      </div>

    </section>
  )
}