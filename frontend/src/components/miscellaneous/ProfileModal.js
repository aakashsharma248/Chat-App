import { ViewIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  IconButton,
  Text,
  Image,
  useToast
} from "@chakra-ui/react";
import { useState } from "react";

import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import axios from "axios";

const ProfileModal = ({ user, children, setUser }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [updateProfile, setUpdateProfile] = useState(false);
  const [name, setName] = useState(user.name);
  const toast = useToast();
  const [picLoading, setPicLoading] = useState(false);
  const [pic, setPic] = useState(user.pic);

  const editProfile = async () => {
    if(pic === user.pic && name === user.name) {
      toast({
        title: "Profile details already updated",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const data = await axios.put(
        "/api/user/updateProfile",
        {
          _id: user._id,
          email: user.email,
          pic: pic,
          name: name,
        },
        config
      );
      const modifiedData = {...user, pic: data.data.pic, name: data.data.name }
      setUser(modifiedData);
      localStorage.setItem("userInfo", JSON.stringify(modifiedData));
      toast({
        title: "Updated Profile Successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
    catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
    setUpdateProfile(false);
    onClose();
  };

  const onCloseUpdateProfileModal = () => {
    setUpdateProfile(false);
    onClose();
  };

  const postDetails = (pics) => {
    setPicLoading(true);
    if (pics === undefined) {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "chat-app");
      data.append("cloud_name", "dlzas8qmh");
      fetch("https://api.cloudinary.com/v1_1/dlzas8qmh/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString());
          console.log(data.url.toString());
          setPicLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setPicLoading(false);
        });
    } else {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }
  };

  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton d={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />
      )}
      {updateProfile ? (
        <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered closeOnOverlayClick={false}>
          <ModalOverlay />
          <ModalContent h="310px">
            <ModalBody
              d="flex"
              flexDir="column"
              alignItems="center"
              justifyContent="space-between"
            >
              <VStack spacing="5px">
                <FormControl id="first-name">
                  <FormLabel mt={18}>Name</FormLabel>
                  <Input
                    placeholder="Enter Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </FormControl>
                <FormControl id="pic">
                  <FormLabel mt={18}>Upload your Picture</FormLabel>
                  <Input
                    type="file"
                    p={1.5}
                    accept="image/*"
                    onChange={(e) => postDetails(e.target.files[0])}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button onClick={editProfile} ml={5} colorScheme="messenger" isLoading={picLoading}>
                Update
              </Button>
              <Button
                onClick={onCloseUpdateProfileModal}
                ml={5}
                colorScheme="red"
              >
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      ) : (
        <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered closeOnOverlayClick={false}>
          <ModalOverlay />
          <ModalContent h="410px">
            <ModalHeader
              fontSize="40px"
              fontFamily="Work sans"
              d="flex"
              justifyContent="center"
            >
              {user.name}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody
              d="flex"
              flexDir="column"
              alignItems="center"
              justifyContent="space-between"
            >
              <Image
                borderRadius="full"
                boxSize="150px"
                src={user.pic}
                alt={user.name}
              />
              <Button
                d="flex"
                fontSize={{ base: "17px", md: "10px", lg: "17px" }}
                mt={2}
                onClick={() => setUpdateProfile(true)}
                colorScheme='messenger'
              >
                Edit Profile
              </Button>
              <Text
                fontSize={{ base: "28px", md: "30px" }}
                fontFamily="Work sans"
              >
                Email: {user.email}
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button onClick={onClose} colorScheme='red' mb={10}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default ProfileModal;
