import { useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row, Tab, Tabs } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaEye, FaEyeSlash, FaLock, FaUser } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    setError: setProfileError
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || ''
    }
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    setError: setPasswordError,
    watch,
    reset: resetPasswordForm
  } = useForm();

  const newPassword = watch('newPassword');

  const onProfileSubmit = async (data) => {
    setIsUpdatingProfile(true);
    
    try {
      const result = await updateProfile(data);
      
      if (result.success) {
        toast.success('Profile updated successfully!');
      } else {
        setProfileError('root', { message: result.error });
      }
    } catch (err) {
      setProfileError('root', { message: 'An unexpected error occurred' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setIsChangingPassword(true);
    
    try {
      const { confirmPassword, ...passwordData } = data;
      const result = await changePassword(passwordData);
      
      if (result.success) {
        toast.success('Password changed successfully!');
        resetPasswordForm();
      } else {
        setPasswordError('root', { message: result.error });
      }
    } catch (err) {
      setPasswordError('root', { message: 'An unexpected error occurred' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <div className="mb-4">
            <h2>My Profile</h2>
            <p className="text-muted">Manage your account settings and preferences</p>
          </div>

          <Tabs defaultActiveKey="profile" className="mb-4">
            {/* Profile Information Tab */}
            <Tab eventKey="profile" title={<><FaUser className="me-2" />Profile Information</>}>
              <Card className="shadow-sm">
                <Card.Body>
                  {profileErrors.root && (
                    <Alert variant="danger" className="mb-4">
                      {profileErrors.root.message}
                    </Alert>
                  )}

                  <Form onSubmit={handleProfileSubmit(onProfileSubmit)}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Full Name</Form.Label>
                          <Form.Control
                            type="text"
                            {...registerProfile('name', {
                              required: 'Name is required',
                              minLength: {
                                value: 2,
                                message: 'Name must be at least 2 characters'
                              }
                            })}
                            isInvalid={!!profileErrors.name}
                          />
                          <Form.Control.Feedback type="invalid">
                            {profileErrors.name?.message}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email Address</Form.Label>
                          <Form.Control
                            type="email"
                            {...registerProfile('email', {
                              required: 'Email is required',
                              pattern: {
                                value: /^\S+@\S+$/i,
                                message: 'Invalid email address'
                              }
                            })}
                            isInvalid={!!profileErrors.email}
                          />
                          <Form.Control.Feedback type="invalid">
                            {profileErrors.email?.message}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="mb-3">
                      <strong>Account Information:</strong>
                      <div className="mt-2">
                        <div className="text-muted">
                          <strong>Role:</strong> {user?.role === 'admin' ? 'Administrator' : 'Customer'}
                        </div>
                        <div className="text-muted">
                          <strong>Member since:</strong> {new Date(user?.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isUpdatingProfile}
                    >
                      {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Tab>

            {/* Change Password Tab */}
            <Tab eventKey="password" title={<><FaLock className="me-2" />Change Password</>}>
              <Card className="shadow-sm">
                <Card.Body>
                  {passwordErrors.root && (
                    <Alert variant="danger" className="mb-4">
                      {passwordErrors.root.message}
                    </Alert>
                  )}

                  <Form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
                    <Form.Group className="mb-3">
                      <Form.Label>Current Password</Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type={showCurrentPassword ? 'text' : 'password'}
                          {...registerPassword('currentPassword', {
                            required: 'Current password is required'
                          })}
                          isInvalid={!!passwordErrors.currentPassword}
                        />
                        <Button
                          variant="link"
                          className="position-absolute end-0 top-50 translate-middle-y border-0 text-muted"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          style={{ zIndex: 10 }}
                        >
                          {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                        <Form.Control.Feedback type="invalid">
                          {passwordErrors.currentPassword?.message}
                        </Form.Control.Feedback>
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type={showNewPassword ? 'text' : 'password'}
                          {...registerPassword('newPassword', {
                            required: 'New password is required',
                            minLength: {
                              value: 6,
                              message: 'Password must be at least 6 characters'
                            },
                            pattern: {
                              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                              message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                            }
                          })}
                          isInvalid={!!passwordErrors.newPassword}
                        />
                        <Button
                          variant="link"
                          className="position-absolute end-0 top-50 translate-middle-y border-0 text-muted"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          style={{ zIndex: 10 }}
                        >
                          {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                        <Form.Control.Feedback type="invalid">
                          {passwordErrors.newPassword?.message}
                        </Form.Control.Feedback>
                      </div>
                      <Form.Text className="text-muted">
                        Password must contain at least one uppercase letter, one lowercase letter, and one number.
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Confirm New Password</Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type={showConfirmPassword ? 'text' : 'password'}
                          {...registerPassword('confirmPassword', {
                            required: 'Please confirm your new password',
                            validate: value =>
                              value === newPassword || 'Passwords do not match'
                          })}
                          isInvalid={!!passwordErrors.confirmPassword}
                        />
                        <Button
                          variant="link"
                          className="position-absolute end-0 top-50 translate-middle-y border-0 text-muted"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{ zIndex: 10 }}
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                        <Form.Control.Feedback type="invalid">
                          {passwordErrors.confirmPassword?.message}
                        </Form.Control.Feedback>
                      </div>
                    </Form.Group>

                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isChangingPassword}
                    >
                      {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;