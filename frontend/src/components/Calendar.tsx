import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import {
  Wrapper,
  Header,
  HTitle,
  HLogo,
  Content,
  LogOutButton,
} from "./styled/calendarStyled";
import Table from "./Table";

import { StoreInterface } from "../interfaces/store";

interface OwnProps {
  store?: StoreInterface;
}

class Calendar extends Component<OwnProps> {
  componentDidMount() {
    try {
      this.props.store.calendar.fetchBirthdays();
    } catch (error) {
      console.error(error);
      this.props.store.auth.logOut();
    }
  }

  render() {
    const {
      calendar: { birthdays, birthdaysFetched, startCreating, creating },
      auth: { logOut, loggedIn },
    } = this.props.store;
    if (!birthdaysFetched) return <div>Loading...</div>;
    return (
      <Wrapper>
        <Header>
          <HTitle>BIRTHDAY.WATCH</HTitle>
          <HLogo
            src="https://townbbpublic.s3.us-east-2.amazonaws.com/birthday_logo.png"
            alt="logo"
          ></HLogo>
          <LogOutButton
            onClick={logOut}
            style={{ position: "absolute", top: "100px", right: "250px" }}
          >
            Log Out
          </LogOutButton>
        </Header>
        <Content>
          <Table />
        </Content>
      </Wrapper>
    );
  }
}
export default inject("store")(observer(Calendar));