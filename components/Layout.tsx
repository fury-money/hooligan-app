import { Center, HStack, Stack, Text } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'
import Logo from './Logo'
import { isMobile } from 'react-device-detect'
import SideNav from './SideNav'
import RPCStatus from './RPCStatus'
import Header from './Header'

type Props = PropsWithChildren & {}

const Mobile = () => (
  <Center h="90vh" p={10} flexDir="column" display={['flex', 'none']} gap={10}>
    <Logo />
    <Text fontSize="xl" textAlign="center" variant="label">
      Mobile support <br /> coming soon
    </Text>
  </Center>
)

const Layout = ({ children }: Props) => {
  if (isMobile) return <Mobile />
  return (
    <HStack w="100vw" h="100vh" gap="0">
      <SideNav />
      <Stack ml="300px" h="full" w="full">
        <Header />
        <RPCStatus />
        <Stack p="10" h="full" as="main" overflowY="auto" alignItems="flex-start">
          {children}
        </Stack>
      </Stack>
    </HStack>
  )
}

export default Layout
