import { Action } from '@/types/tx'
import { Button, ButtonProps, Modal, ModalOverlay, useDisclosure } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'
import ConfrimDetails from './ConfrimDetails'
import { LoadingContent } from './LoadingContent'
import { TxDetails } from './TxDetails'

type Props = PropsWithChildren & {
  label: string
  action?: Action
  isDisabled?: boolean
  buttonProps?: ButtonProps
}

const ConfirmModal = ({
  children,
  label = 'Open',
  action,
  isDisabled = false,
  buttonProps,
}: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const onModalClose = () => {
    onClose()
    action?.tx.reset()
  }
  return (
    <>
      <Button
        isLoading={action?.simulate.isLoading || action?.tx.isPending}
        isDisabled={isDisabled || action?.simulate.isError || !action?.simulate.data}
        onClick={onOpen}
        {...buttonProps}
      >
        {label}
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={onModalClose}
        closeOnOverlayClick={false}
        isCentered
        size="xl"
      >
        <ModalOverlay />
        <LoadingContent action={action} />
        <ConfrimDetails action={action}>{children}</ConfrimDetails>
        <TxDetails action={action} onClose={onModalClose} />
      </Modal>
    </>
  )
}

export default ConfirmModal