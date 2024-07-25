export interface ReviewCardProps {
  name: string;
  role: string;
  imgUrl?: string;
  review: React.ReactNode;
  className?: string;
  createdAt?: string;
  [key: string]: any;
}
