export interface Menu {
  id: number;
  nom: string;
  description: string;
  prix: number;
  imageUrl: string;
  jourDeLaSemaine: string;
  ingredients: string[];
  allergenes?: string[];
} 