import { Box, HStack, Image, Stack, Text } from '@chakra-ui/react'
import {
  ChakraStylesConfig,
  GroupBase,
  OptionProps,
  Select as ChakraSelect,
  SingleValue,
  chakraComponents,
} from 'chakra-react-select'

type Props = {}

const options = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3' },
]

const chakraStyles: ChakraStylesConfig = {
  singleValue: (provided, state) => ({
    ...provided,
    border: 'none',
    fontSize: '16px',
    px: 2,
    cursor: 'pointer',
  }),
  control: (provided, state) => ({
    ...provided,
    bg: 'transparent',
    border: 'none',
    boxShadow: 'none',
    borderRadius: 16,
    _focus: {
      boxShadow: 'none',
    },
  }),
  container: (provided, state) => ({
    ...provided,
    padding: 1,
    borderRadius: 16,
    bg: '#C445F0',
    color: '#fff',
  }),
  option: (provided) => ({
    ...provided,
    bg: 'transparent',
    color: '#fff',
    cursor: 'pointer',
    width: 'full',
    _selected: {
      bg: '#C445F0',
    },
    _hover: {
      bg: '#C445F0',
    },
  }),
  menuList: (provided, state) => ({
    ...provided,
    padding: 0,
    // bg: '#191919',
    // border: '2px solid #3A3A3A',
    minW: 'full',
    borderRadius: 16,
    width: 'max-content',
    minWidth: '200px',
    ml: '-50px',
  }),
}

const Select = (props: Props) => {
  return (
    <ChakraSelect
      isSearchable={false}
      variant="unstyled"
      chakraStyles={chakraStyles}
      // defaultValue={defaultValue}
      options={options}
      // onChange={onChange}
      // components={{
      //   Option: CustomOption,
      //   SingleValue: CustomSelectValue,
      // }}
    />
  )
}

export default Select
