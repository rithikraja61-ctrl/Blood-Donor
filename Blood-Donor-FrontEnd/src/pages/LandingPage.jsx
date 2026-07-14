import LandingLayout from '../layouts/LandingLayout';
import BrandHeader from '../components/landing/BrandHeader';
import CardGrid from '../components/landing/CardGrid';

function LandingPage() {
  return (
    <LandingLayout>
      <BrandHeader />
      <CardGrid />
    </LandingLayout>
  );
}

export default LandingPage;