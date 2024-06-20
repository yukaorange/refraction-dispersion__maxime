
import { Experience } from '@/components/Experience'
import { Sns } from '@/components/Sns'
import { MenuButton } from '@/components/MenuButton'
import { Loader } from '@react-three/drei'

const App = () => {
  return (
    <>
      <Loader />
      <MenuButton />
      <Sns />
      <Experience />
    </>
  )
}

export default App
