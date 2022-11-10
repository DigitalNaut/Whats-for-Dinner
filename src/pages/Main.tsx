import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

import Roulette from "src/components/Roulette";

const history: { name: string; imageUrl: string }[] = [
  {
    name: "Tacos al pastor",
    imageUrl:
      "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
  {
    name: "Pozole", // c-spell-checker:disable-line
    imageUrl:
      "https://images.unsplash.com/photo-1649532245300-c3ed0565ffa4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
  {
    name: "Ensalada de atún",
    imageUrl:
      "https://images.unsplash.com/photo-1612949060306-4c298ad7f34c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
  {
    name: "Sopa de pollo",
    imageUrl:
      "https://images.unsplash.com/photo-1569058242276-0bc3e078cf86?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
  {
    name: "Ensalada verde",
    imageUrl:
      "https://images.unsplash.com/photo-1608032077018-c9aad9565d29?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
  {
    name: "Carne asada",
    imageUrl:
      "https://images.unsplash.com/photo-1612871689353-cccf581d667b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
  {
    name: "Pizza",
    imageUrl:
      "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
  {
    name: "Hamburguesa",
    imageUrl:
      "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
  {
    name: "Pollo empanizado", // c-spell-checker:disable-line
    imageUrl:
      "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
  {
    name: "Arroz con pollo",
    imageUrl:
      "https://images.unsplash.com/photo-1569058242252-623df46b5025?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
];

export default function Main() {
  return (
    <div className="flex flex-col w-full gap-8">
      <Roulette />

      <div className="flex p-2 gap-4 min-w-full overflow-x-auto bg-slate-700 ">
        {history.map((dish) => (
          <div className="group" key={dish.name}>
            <div className="relative w-16 md:w-24 lg:w-28 aspect-square rounded-lg bg-gray-700 overflow-hidden">
              <span className="absolute text-center text-sm w-full h-full m-auto hidden group-hover:block bg-black/50 pointer-events-none">
                {dish.name}
              </span>
              <img
                className="w-full h-full object-cover"
                src={dish.imageUrl}
                alt={dish.name}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="fixed left-1/2 -translate-x-1/2 bottom-16 flex items-center w-fit">
        <button data-filled>
          <FontAwesomeIcon icon={faEdit} />
          <span>Editar menú</span>
        </button>
      </div>
    </div>
  );
}
