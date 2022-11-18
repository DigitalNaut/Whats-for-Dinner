import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <h2 className="text-6xl">404</h2>
      <h3 className="text-2xl">Página no encontrada</h3>
      <Link className="m-auto flex items-center gap-1 underline" to="/">
        <FontAwesomeIcon icon={faChevronLeft} />
        Volver al inicio
      </Link>
    </div>
  );
}
