export type Product = {
  id: string;
  title: string;
  price: number;
  category: string;
  seller: string;
  placeholderColor: string;
  emoji: string;
  rating: number;
  reviews: number;
  location: string;
  condition: 'New' | 'Like New' | 'Used' | 'Barely Used';
  verified: boolean;
};

export const PRODUCTS: Product[] = [
  { id: '1', title: 'MacBook Pro 14" M3', price: 1850, category: 'Electronics', seller: 'ama_b', placeholderColor: '#E0E7FF', emoji: '💻', rating: 4.9, reviews: 32, location: 'Hall 7', condition: 'Like New', verified: true },
  { id: '2', title: 'Calculus Early Transcendentals', price: 80, category: 'Books', seller: 'kojo_a', placeholderColor: '#FEF3C7', emoji: '📘', rating: 4.8, reviews: 15, location: 'Brunei Complex', condition: 'Like New', verified: true },
  { id: '3', title: 'iPhone 13, 128GB', price: 2500, category: 'Electronics', seller: 'seller_sophie', placeholderColor: '#DBEAFE', emoji: '📱', rating: 4.9, reviews: 27, location: "St. Theresa's Hostel", condition: 'Used', verified: true },
  { id: '4', title: 'Mini Fridge, barely used', price: 600, category: 'Furniture', seller: 'martin_o', placeholderColor: '#D1FAE5', emoji: '🧊', rating: 4.7, reviews: 9, location: 'Conti', condition: 'Barely Used', verified: true },
  { id: '5', title: 'Jollof Rice & Chicken', price: 25, category: 'Food', seller: 'foodie_kwabena', placeholderColor: '#FED7AA', emoji: '🍚', rating: 4.8, reviews: 42, location: 'Katanga Hall', condition: 'New', verified: true },
  { id: '6', title: 'Lecture Notes Package', price: 40, category: 'Books', seller: 'sika_design', placeholderColor: '#FEF9C3', emoji: '📝', rating: 4.9, reviews: 18, location: 'Brunei Complex', condition: 'New', verified: true },
  { id: '7', title: 'Study Lamp LED', price: 120, category: 'Furniture', seller: 'sika_design', placeholderColor: '#FEF3C7', emoji: '💡', rating: 4.6, reviews: 11, location: 'Hall 7', condition: 'Like New', verified: true },
  { id: '8', title: 'AirPods Pro 2nd Gen', price: 950, category: 'Electronics', seller: 'tech_yaw', placeholderColor: '#DBEAFE', emoji: '🎧', rating: 4.9, reviews: 23, location: 'Conti', condition: 'Used', verified: true },
  { id: '9', title: 'Plantain Chips (Big Pack)', price: 15, category: 'Food', seller: 'foodie_kwabena', placeholderColor: '#FED7AA', emoji: '🍌', rating: 4.7, reviews: 19, location: 'Katanga Hall', condition: 'New', verified: true },
  { id: '10', title: 'Wooden Study Desk', price: 350, category: 'Furniture', seller: 'sika_design', placeholderColor: '#FEF9C3', emoji: '🪑', rating: 4.5, reviews: 7, location: 'Conti', condition: 'Used', verified: false },
  { id: '11', title: 'Samsung Galaxy A54', price: 1900, category: 'Electronics', seller: 'tech_yaw', placeholderColor: '#DBEAFE', emoji: '📲', rating: 4.8, reviews: 14, location: 'Hall 7', condition: 'Like New', verified: true },
  { id: '12', title: 'Denim Jacket, Size M', price: 130, category: 'Fashion', seller: 'styleby_abena', placeholderColor: '#FCE7F3', emoji: '🧥', rating: 4.6, reviews: 8, location: "St. Theresa's Hostel", condition: 'Used', verified: true },
  { id: '13', title: 'Waakye Special (with extras)', price: 35, category: 'Food', seller: 'foodie_kwabena', placeholderColor: '#FED7AA', emoji: '🍛', rating: 4.9, reviews: 31, location: 'Katanga Hall', condition: 'New', verified: true },
  { id: '14', title: 'Intro to Psychology Textbook', price: 70, category: 'Books', seller: 'kojo_a', placeholderColor: '#FEF3C7', emoji: '📗', rating: 4.7, reviews: 12, location: 'Brunei Complex', condition: 'Like New', verified: true },
  { id: '15', title: 'Sneakers, Size 42', price: 180, category: 'Fashion', seller: 'styleby_abena', placeholderColor: '#FCE7F3', emoji: '👟', rating: 4.8, reviews: 16, location: 'Hall 7', condition: 'Used', verified: true },
  { id: '16', title: 'Power Bank 20000mAh', price: 110, category: 'Electronics', seller: 'tech_yaw', placeholderColor: '#DBEAFE', emoji: '🔋', rating: 4.6, reviews: 9, location: 'Hall 7', condition: 'New', verified: false },
  { id: '17', title: 'Bedside Bookshelf', price: 90, category: 'Furniture', seller: 'sika_design', placeholderColor: '#FEF9C3', emoji: '📚', rating: 4.5, reviews: 6, location: 'Conti', condition: 'Used', verified: true },
  { id: '18', title: 'Vintage Guitar', price: 4200, category: 'Other', seller: 'seller_sophie', placeholderColor: '#E0E7FF', emoji: '🎸', rating: 4.9, reviews: 5, location: "St. Theresa's Hostel", condition: 'Used', verified: true },
  { id: '19', title: 'Wristwatch, Leather Strap', price: 150, category: 'Fashion', seller: 'styleby_abena', placeholderColor: '#FCE7F3', emoji: '⌚', rating: 4.7, reviews: 10, location: 'Hall 7', condition: 'New', verified: true },
  { id: '20', title: 'Domain Name Sale (premium-brand.com)', price: 12000, category: 'Other', seller: 'ama_b', placeholderColor: '#E0E7FF', emoji: '🌐', rating: 5.0, reviews: 2, location: 'Katanga Hall', condition: 'New', verified: true },
];

export const CATEGORIES = [
  { name: 'All', emoji: '⊞' },
  { name: 'Books', emoji: '📗' },
  { name: 'Electronics', emoji: '💻' },
  { name: 'Food', emoji: '🍔' },
  { name: 'Hostel Items', emoji: '🛏️' },
  { name: 'Fashion', emoji: '👕' },
];