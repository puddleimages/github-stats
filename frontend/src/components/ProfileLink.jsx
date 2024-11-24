
const ProfileLink = () => (
  <a
    key={import.meta.env.VITE_USERNAME}
    href={`https://github.com/${import.meta.env.VITE_USERNAME}`}
    target="_blank"
    rel="noopener noreferrer"
  >
    GitHub Profile Page
  </a>
);

export default ProfileLink;
