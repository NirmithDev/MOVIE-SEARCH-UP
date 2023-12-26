doctype html
head
  meta(charset='utf-8')
  meta(name='viewport' content='width=device-width, initial-scale=1')
  link(rel='stylesheet' href='../style/style2.css')
  link(rel='stylesheet' href='../style/style.css')
  link(rel='stylesheet' href='../style/style3.css')
  link(rel='stylesheet' href='../style/style4.css')
  link(href='https://fonts.googleapis.com/css2?family=Roboto:wght@500&display=swap' rel='stylesheet')
  title The Movie Page
// NavBar
header
  nav
    ul.nav_links
      a(href='/')
        li#link Search
// The add movie stuff which allows the user to throw in his opinions
div
  // Movie info
  #movie_Container
    // Maybe create a form
    #reviews(style='height: 40%;width: 100%; padding-top: 5px;')
      input#name(type='text' placeholder='Enter name of the movie' style=' height: 10%; width: 30%; margin-top: 5px;')
      input#plot(type='text' placeholder='Enter plot of the movie' style=' height: 20%; width: 99%; margin-top: 5px;')
      input#actor(type='text' placeholder='Enter actors' style=' height: 20%; width: 99%; margin-top: 5px;')
      input#genre(type='text' placeholder='Enter genre of the movie' style=' height: 20%; width: 99%; margin-top: 5px;')
      input#duration(type='text' placeholder='Enter duration' style=' height: 20%; width: 99%; margin-top: 5px;')
      input#year_release(type='text' placeholder='Enter year of release' style=' height: 20%; width: 99%; margin-top: 5px;')
      input#poster(type='text' placeholder='Enter poster link' style=' height: 20%; width: 99%; margin-top: 5px;')
      button#submit_rev(type='button' onclick='submit()' style='float: right; border-radius: 10px; height: 40px; width: 100px; outline: none;') Add Movie
