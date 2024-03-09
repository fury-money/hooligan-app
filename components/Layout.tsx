import { Box, Center, HStack, Image, Stack, Text } from '@chakra-ui/react'
import { Fragment, PropsWithChildren } from 'react'
import Header from './Header'
import Logo from './Logo'
import RPCStatus from './RPCStatus'
import SideNav from './SideNav'

type Props = PropsWithChildren & {}

const Mobile = () => (
  <Center h="90vh" p={10} flexDir="column" display={['flex', 'none']} gap={10}>
    <Logo />
    <Text fontSize="xl" textAlign="center" variant="label">
      Mobile support <br /> coming soon
    </Text>
  </Center>
)

const HexagonBackground = () => (
  <Box position="absolute" top="0" right="0" zIndex="1" display={['none', 'block']}>
    <Image src="/images/backgrounds/right.svg" alt="Hexagon" />
  </Box>
)

const Layout = ({ children }: Props) => {
  return (
    <Fragment>
      <Mobile />

      <HStack w="100vw" h="100vh" display={['none', 'flex']}>
        <HexagonBackground />
        <Stack flexGrow={1} flexBasis="240px" alignItems="flex-end" overflow="auto">
          <SideNav />
        </Stack>
        <Stack h="full" flexGrow={1} flexBasis="1200px" overflow="auto" alignItems="self-start">
          <Header />
          <Stack as="main" p="10" maxW="1200px" w="full" flex={1}>
            <RPCStatus />
            {children}
          </Stack>
        </Stack>
      </HStack>
    </Fragment>
  )
}

export default Layout
