import "../styles/Home.css";
import Hero from "../components/Home/Hero";
import A_Propos from "../components/Home/A_Propos";
import Services from "../components/Home/Services";
import Testimonials from "../components/Home/Testimonials";
import Solutions from "../components/Home/Solutions";   
import Footer from "../components/Home/Footer";
const Home = () => {
  return (
    <>
      <div id="hero"><Hero /></div>
      <A_Propos />
      <Services />
      <Solutions />
      <Testimonials />
      <div id="footer"><Footer /></div>
     
      
      
      
   
    </>
  );
};

export default Home;
