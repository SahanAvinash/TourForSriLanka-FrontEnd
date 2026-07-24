import carImg from "../assets/transport/car.png";
import vanImg from "../assets/transport/van.png";
import busImg from "../assets/transport/bus.png";
import jeepImg from "../assets/transport/jeep.png";
import driverImg from "../assets/transport/driver.jpg";
import reviewerImg from "../assets/transport/reviewer.jpg";

const owner = {
  name: "Shantha Mendis",
  email: "shantha@gmail.com",
  phone: "0773254671",
  image: driverImg,
  areas: "Colombo, Anuradhapura, Galle, Kandy, Mirissa, Sigiriya",
};

export const vehicles = [
  {
    id: 1,
    name: "Toyota Aqua",
    type: "car",
    image: carImg,
    passengers: 4,
    bags: 2,
    location: "Colombo",
    price: 8000,
    rating: 5.0,
    reviews: 128,
    ac: true,
    services: ["airport-pickup", "airport-drop", "ride-now"],
    owner,
  },
  {
    id: 2,
    name: "KDH Van",
    type: "van",
    image: vanImg,
    passengers: 10,
    bags: 6,
    location: "Colombo",
    price: 15000,
    rating: 5.0,
    reviews: 96,
    ac: true,
    services: ["airport-pickup", "airport-drop", "ride-now", "tours"],
    owner,
  },
  {
    id: 3,
    name: "Luxury Bus",
    type: "bus",
    image: busImg,
    passengers: 35,
    bags: 25,
    location: "Colombo",
    price: 45000,
    rating: 5.0,
    reviews: 72,
    ac: true,
    services: ["airport-pickup", "airport-drop", "tours"],
    owner,
  },
  {
    id: 4,
    name: "Jeep Wrangler",
    type: "jeep",
    image: jeepImg,
    passengers: 4,
    bags: 3,
    location: "Kandy",
    price: 22000,
    rating: 5.0,
    reviews: 64,
    ac: true,
    services: ["tours"],
    owner,
  },
];

export const vehicleTypes = [
  {
    type: "car",
    title: "Car",
    text: "Comfortable rides for small groups",
    image: carImg,
  },
  {
    type: "van",
    title: "Van",
    text: "Spacious rides for groups",
    image: vanImg,
  },
  {
    type: "bus",
    title: "Bus",
    text: "Best for large groups",
    image: busImg,
  },
  {
    type: "jeep",
    title: "Jeep",
    text: "Perfect for adventure and hilly areas",
    image: jeepImg,
  },
];

export const review = {
  name: "Richard",
  country: "USA",
  image: reviewerImg,
  rating: 5.0,
  time: "2 Weeks ago",
  text: "The vehicle was comfortable, clean, and perfectly suited for our journey.",
};