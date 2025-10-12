export interface IBaseCategory {
  id: number;
  name: string;
  slug: string;
}

export interface ICategory extends IBaseCategory {
  created_at: string | any;
  updated_at: string | any;
  deleted_at: string | any;
}