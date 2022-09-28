import * as Dialog from "@radix-ui/react-dialog";
import classNames from "classnames";
import { useEffect, useState } from "react";
import ConnectionsChart from "../../layout/Connections/ConnectionsChart";
import { CompactNumberFormat } from "../../utils/NumberFormatting";
import UserTypeBadge from "../UserTypeLabel/UserTypeBadge";

import './UserInfoPanel.scss';

const CONNECTION_TYPES = {
  followers: 'Followers',
  following: 'Following',
  combined:  'Combined',
}

export default function UserInfoPanel({ show, onHide, user }) {

  const [connectionType, setConnectionType] = useState('followers');

  // For better UX, reset connections back to 'followers' when overlay is reopened:
  useEffect(() => {
    show && setConnectionType('followers');
  }, [show]);

  return (
    <Dialog.Root open={show} onOpenChange={onHide}>
      <Dialog.Portal>
        <Dialog.Overlay className='__user-info-panel __dialog-overlay'>
          <Dialog.Content className='__user-info-panel-content'>
          <UserTypeBadge userType={user?.type} variant='solid' size='md' />
            <img className="profile-pic" src={user?.twitter_profile_image_url} />

            <div className="username">{ user?.name }</div >
            <div className="handle">@{ user?.twitter_username }</div>
            <div className="description">{ user?.twitter_description }</div>

            <div className='connections-tab'>
              { Object.entries(CONNECTION_TYPES).map(([type, phrase]) => (
                <div key={type} role="button" className={classNames('tab', { selected: type === connectionType })} onClick={() => setConnectionType(type)}>
                  { phrase }
                </div>
              ))}
            </div>

            <ConnectionsChart connectionType={connectionType} user={user} showCount={false} />

            <div className="connection-totals">
              <div>
                <div className="count">{ CompactNumberFormat(user?.following_data.total) }</div>
                <div className="label">Following</div>
              </div>
              <div>
                <div className="count">{ CompactNumberFormat(user?.follower_data.total) }</div>
                <div className="label">Followers</div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );

  // return (
  //   <Modal show={show} onHide={onHide} className="__user-info-modal">
  //     <UserTypeLabel userType={user?.type} />
      
  //     <img className="profile-pic" src={user?.twitter_profile_image_url} />

  //     <div className="username">{ user?.name }</div >
  //     <div className="handle">@{ user?.twitter_username }</div>
  //     <div className="description">{ user?.twitter_description }</div>

  //     <ConnectionsChart connectionType={connectionType} user={user} showCount={false} />

  //     <div className="connection-totals">
  //       <div>
  //         <div className="count">{ CompactNumberFormat(user?.following_data.total) }</div>
  //         <div className="label">Following</div>
  //       </div>
  //       <div>
  //         <div className="count">{ CompactNumberFormat(user?.follower_data.total) }</div>
  //         <div className="label">Followers</div>
  //       </div>
  //     </div>
  //   </Modal>
  // )
}
