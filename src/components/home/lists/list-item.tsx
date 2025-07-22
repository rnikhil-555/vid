import { CarouselComponent } from "../carousel";
import { Shows } from "@/types/tmdbApi";

const ListRow = async ({ items }: { items: Shows[] }) => {
  return (
    <div>
      <div className="flex pt-4">
        <CarouselComponent
          shows={
            items! as Pick<
              Shows,
              | "id"
              | "title"
              | "poster_path"
              | "vote_average"
              | "original_language"
            >[]
          }
        />
      </div>
    </div>
  );
};

export default ListRow;
