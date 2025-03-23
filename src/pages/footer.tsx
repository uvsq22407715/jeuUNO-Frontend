export const Footer = () => {

  return (
    <footer className="w-full py-6 px-8 bg-uno-dark text-uno-light animate-fade-in">
      <div className="container max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={"./favicon.ico"} alt="Logo" className="h-10 w-auto mr-2" />
          <h1 className="text-2xl font-bold tracking-tight">Jeu</h1>
        </div>
        <div className="text-sm">
          Développé par :<br />
          <span className="font-bold">Ziad SOUALAH MOHAMMED</span>
          <br />
          <span className="font-bold">Islam TEBAIBIA</span>
          <br />
          <span className="font-bold">Tom NOEL</span>
          <br />
          <span className="font-bold">Mohamed Chakib NEGGAZI</span>
        </div>
      </div>
    </footer>
  );
};
