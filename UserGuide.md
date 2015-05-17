

# Overview of Options #

PRS+ is a custom firmware that enhances the existing firmware on your Sony Reader. PRS+ does not replace the original Sony firmware; rather, it adds further customization options to enhance your reading experience. Below you will find an overview of the many customization options available with PRS+. (Note: Some options are only available with certain models and are so noted with the appropriate model numbers, eg., "350/650/950.")

## Key Bindings ##
Key bindings allow you to (re-)assign various functions to the hardware buttons. Separate functions can be assigned to a short press and long press (hold for 3-5 seconds). For example, you might re-assign the Home button so that it opens the Table of Contents with a short press or puts the Reader to sleep with a long press.

Key functions are context specific. There are 3 different contexts:

  * Global - works everywhere (this makes sense for actions like "take a screenshot")
  * When in Menu - works only when you are in the main menu
  * When Reading Book - works only when you are reading a book

See also [Actions](#Actions.md).

---

## Menu Customizer ##
Menu Customizer allows you to customize the main menu. Some menu items ("slots") belong to the system and cannot be replaced; these are referred to as "fixed slots." Slots are numbered as follows:

| 300/505 | 600`*` | 350/650/950 |
|:--------|:-------|:------------|
| ![http://wiki.prs-plus.googlecode.com/hg/img/um20/menu-slots-300-505.jpg](http://wiki.prs-plus.googlecode.com/hg/img/um20/menu-slots-300-505.jpg) | ![http://wiki.prs-plus.googlecode.com/hg/img/um20/menu-slots-600.jpg](http://wiki.prs-plus.googlecode.com/hg/img/um20/menu-slots-600.jpg) <br><br> <code>*</code>This doesn't look logical, but it's how they are numbered internally. <table><thead><th> <img src='http://wiki.prs-plus.googlecode.com/hg/img/um20/menu-slots-x50.jpg' /> </th></thead><tbody></tbody></table>

<hr />

<h2>Book History</h2>

<h3>Book History</h3>
Book History allows you to choose how many recently read books are remembered. Select "Disabled" to switch it off. The "Disabled" option can also be used to reset the list.<br>
<h3>Skip book menu (300/505)</h3>
This option allows you to skip the book menu when opening books via Book History.<br>
<table><thead><th> Entering book </th><th> Skip book menu when entering a book </th></thead><tbody>
<tr><td> Exiting book  </td><td> Skip book menu when exiting a book  </td></tr>
<tr><td> Always        </td><td> Always show book menu               </td></tr>
<tr><td> Always        </td><td> Never show book menu                </td></tr></tbody></table>

<hr />
<h2>Browse Folders</h2>
Browse Folders allows you to browse your books by folder.<br>
<br>
<h3>Sorting Mode</h3>
Sorting Mode allows you to choose how books are sorted when you use Browse Folders. Note: Sorting is always case sensitive.<br>
<table><thead><th> By Title </th><th> Sort by book title </th></thead><tbody>
<tr><td> By author then title </td><td> Sort by book author, then title </td></tr>
<tr><td> By filename </td><td> Sort by filename (shows book title and author) </td></tr>
<tr><td> By filename shown as comment </td><td> Sort by filename (shows book title and filename; author is not shown) </td></tr></tbody></table>

<h3>Internal Memory Root folder</h3>
This option allows you to set the default (root) folder that first opens when you use Browse Folders. For instance, if you choose "/books" as your root folder then put all your books in a folder called "books" in the root directory of your Reader, then whenever you select Browse Folders, you will be taken directly to your "books" folder. This saves you at least one click. (Sony software normally puts books into "/database/media/books")<br>
<br>
NOTE: Folder names are case sensitive. If your books are in a folder named "BOOKS" or "Books" and you select "/books" as your startup folder, it will lead to problems.<br>
<br>
<h3>Favorite folders</h3>
This is an advanced feature that allows further customization of the starting view in Browse Folders. See <a href='#folders.cfg.md'>folders.cfg</a> for more details.<br>
<table><thead><th> Enabled </th><th> "Browse Folders" will use the configuration defined in <a href='http://v2-0.prs-plus.googlecode.com/hg/installer/data/database/system/PRSPlus/folders.cfg.sample'>folders.cfg</a> located in /database/system/PRSPlus/ in your Reader's internal memory  </th></thead><tbody>
<tr><td> Disabled </td><td> <a href='http://v2-0.prs-plus.googlecode.com/hg/installer/data/database/system/PRSPlus/folders.cfg.sample'>folders.cfg</a> will be ignored                                                                                                               </td></tr></tbody></table>

<h3>".." (prev folder element)</h3>
If enabled, this option will show ".." in the Browse Folders view. Pressing on ".." has exactly the same effect as pressing on "<-" (back arrow) button.<br>
<br>
<h3>Show File Size & Type in Comment</h3>
If enabled, this adds the file size and type information to book comments.<br>
<br>
<h3>SD/MS Card Scan</h3>
This option controls how MS/SD cards are handled on startup.<br>
<table><thead><th>Enabled </th><th> MS/SD cards are scanned on startup. As with the standard firmware, if you have a huge number of books your MS/SD card, startup will take a very long time. </th></thead><tbody>
<tr><td>Disabled </td><td> MS/SD cards are ignored at startup. Startup will be quick, but files on MS/SD cards will be visible only via <a href='#Browse_Folders.md'>Browse Folders</a>, where you'll get options to copy books to Internal Memory and open them from there. </td></tr>
<tr><td>Disabled (load cache)</td><td> This is a compromise setting that disables scanning, but allows you to open books directly from the SD/MS card. <b>If you don't understand how the cache works, please read <a href='#How_Card_Scan_and_Cache_Work.md'>How Card Scan And Cache Work</a> before using this option. Otherwise, results may be unexpected.</b> </td></tr></tbody></table>

<h3>Use Mount with SD/MS</h3>
If you enable this option, you'll see 2 ways to access SD/MS cards in Browse Folders: normal and "via mount."<br>
<br>
The standard firmware uses an unusual way to access SD/MS card content. Unfortunately it is buggy, but mostly affects users using non-Latin characters (e.g. Chinese, Cyrillic, Georgian). Users who cannot (or do not want to) rename folders and files on an SD/MS card could use this option. In this case, the standard Unix "mount" command is used to access cards. The downside of "mount" is that it is a bit slower, and it is no longer possible to open books directly from cards. (If you try to open a book "via mount" you'll see options to copy it to internal memory and open it from there.)<br>
<hr />

<h2>Book Viewer (350/600/650/950)</h2>
<h3>Don't Mask Overlap (350/650/950)</h3>
When reading in landscape mode, this option shows a mask over the part of the text that belongs to the next/previous half-page, which is standard for the 505/300/600 models.<br>
<br>
While the name of this option may cause some confusion, it is taken from some internal code. Therefore: If set to "true," the mask is not drawn, and the Reader follows the standard behavior of the unaltered firmware. If set to "false" (the default), a mask of white dots will be drawn to gray-out the parts of the text which belong to the next/previous half-page.<br>
<br>
Note: This option doesn't avoid the overlap, it merely obscures it.<br>
<br>
<h3>No Dictionary with Double-Tap</h3>
If set to true, double-tapping no longer activates the dictionary.<br>
<br>
<h3>Close Pop-up Menu by Page Tap</h3>
This option allows you to close the pop-up menu in books (which appears when you double-tap a word or select text) by tapping anywhere on the page above it.<br>
<br>
<h3>Border Color</h3>
This option lets you change the color of the "canvas" shown around some PDFs from grey to white.<br>
<br>
<h3>No Page Turn with Gestures</h3>
This option does exactly what the option's name says. If enabled/set to true, a gesture/swipe will no longer trigger a page turn. Please note that this does <i>not</i> disable touch functionality completely. Only page turns are affected. All other touch features are still accessible.<br>
<br>
There is also a "key-bindable" action to toggle <i>page turn by gestures</i> on/off.<br>
<br>
<h3>Page Turn by Single Tap</h3>
This option lets you turn pages by single-tapping specific areas of the page. You can choose to tap anywhere on the page for Next Page, or you can set it so that tapping one half of the page triggers Next Page, while the other half triggers Previous Page.<br>
<br>
<h3>Panning While in Zoom Lock</h3>
This option allows you to 'drag' a page while in Zoom Lock mode (350/650/950) or Zoom mode (350/600/650/950), so that you can easily navigate to different areas of the page.<br>
<br>
<h3>Custom View Settings (350/650/950)</h3>
These options allow you to bind your own values to the 'custom' setting of the 'Adjust View' option available in books. Use the first two options to set your own custom & brightness levels, and the third to activate them. Now when you are viewing a book, go to 'Adjust View', and press the box next to 'custom'. If you now press the Restore Button, it activates the contrast & brightness levels you set earlier.<br>
<table><thead><th> Custom Contrast </th><th> Allows you to set custom contrast </th></thead><tbody>
<tr><td> Custom Brightness </td><td> Allows you to set custom brightness </td></tr>
<tr><td> Bind to Restore Button </td><td> If set, pressing "restore" triggers custom settings </td></tr></tbody></table>

<h3>User EPUB Style (CSS File)</h3>

This feature allows you to use your own CSS file to specify custom fonts, font-size, line-height, and other CSS formatting. To use this feature, simply copy your custom CSS files into the folder /database/system/PRSPlus/epub<br>
<br>
For more information on adding custom CSS files, and especially on using custom fonts, see<br>
<a href='http://www.anamardoll.com/2011/06/ereader-epub-font-customization-with.html'>Ana Mardoll's blog</a> and multiple threads on Mobile Read, such as <a href='http://www.mobileread.com/forums/showthread.php?t=154685'>this one</a>.<br>
<br>
<hr />
<h2>LRF Text Scale</h2>
This feature allows you to set zoom levels in LRF. <b>You must understand how cache works</b> in order to use this feature. LRF Text Scale only works correctly on books that are not in cache (i.e., books that haven't been opened yet with a custom zoom level); otherwise, it leads to formatting errors, such as missing text/extra space at the bottom).<br>
<br>
<hr />
<h2>Screenshot</h2>
This feature allows you to take a screenshot. To use this feature, you need to bind this action to a key (see <a href='#Key_Bindings.md'>key bindings</a>).<br>
<br>
<hr />
<h2>Scrollbar Alphabet</h2>
This option lets you select the alphabet used in the scrollbar (e.g., Latin, Cyrllic, etc.).<br>
<br>
<hr />
<h2>Standby Image</h2>
<h3>Standby Image Type</h3>
This option allows you to select the standby image.<br>
<br>
<table><thead><th> System default </th><th> For 505/300/600, a random image from /database/system/PRSPlus/wallpaper will appear. For 350/650/950 series, the standby image will be whatever you've set under the standard Sony system settings. </th></thead><tbody>
<tr><td> Current Book Cover </td><td> Displays first page of the current book. If page 1 is an image of the book cover, then the book cover will appear. If page 1 contains only text, then that text will appear.                        </td></tr>
<tr><td> Current Screen </td><td> The currently displayed screen will appear indefinitely. "Sleeping.." text will be shown on the right side of the status bar, replacing the clock (if the clock is enabled)                         </td></tr></tbody></table>

<h3>Dither Image</h3>
This option will additionally "dither" the wallpaper/bookcover. Dithering is a technique to reduce compression artifacts by adding noise. On monochrome displays (such as e-ink), this usually, gives the image a "crisper" overall look.<br>
<br>
<hr />
<h2>Book Management (350/650/950)</h2>

<h3>Customize Home Menu Booklist</h3>

<h4>Book Selection</h4>
This setting allows you to change which books are shown in the Home menu. In addition, there is an action (which you can bind to a key) which cycles through this setting's options.<br>
<table><thead><th> Last Added Books (default) </th><th> Shows the books last added to the device. </th></thead><tbody>
<tr><td> Last Opened Books          </td><td> Shows the last opened books, based on Book History. </td></tr>
<tr><td> Books by Same Author       </td><td> Shows books by the same author as the current book. </td></tr>
<tr><td> Next Books in Collection   </td><td> Shows the next books in the same collection as the current book. Using corresponding action, you can also cycle through collections, if the current book appears in more than one collection. </td></tr>
<tr><td> Random Books               </td><td> Shows randomly chosen books.              </td></tr></tbody></table>

<h4>Ignore Memory Cards</h4>
This setting can be used to ignore SD and Memory Stick cards when compiling the Home menu booklist.<br>
<br>
<h3>Show Reading Progress</h3>
These options display how far you are in each book. It is available for the current book (shown in the Home menu instead of 'Last Read' date/time) and for thumbnails (shown in the Home menu and all thumbnail views).<br>
<table><thead><th> Show for Current Book </th><th> Shows reading progress for the current book </th></thead><tbody>
<tr><td> Format for Current Book </td><td> Allows you to select which format to use (e.g., Page 5 of 100, 5/100, 5%)  </td></tr>
<tr><td> Show for Thumbnails   </td><td> Shows reading progress in all thumbnail views </td></tr>
<tr><td> Format for Thumbnails </td><td> Allows you to select which format to use    </td></tr>
<tr><td> Only show from page   </td><td> Sets a minimum page you have to reach before reading progress is shown. Example: If you choose "only show from page 10," you can open a book and browse through the first 9 pages without triggering reading progress. Reading progress will only appear once you've reached page 10.  </td></tr></tbody></table>

<h3>Hide Default Collections</h3>
These options allow you to hide the three built-in collections and the "Add New Collection" option.<br>
<table><thead><th> Hide Unread Books </th></thead><tbody>
<tr><td> Hide Unread Periodicals </td></tr>
<tr><td> Hide Purchased Books </td></tr>
<tr><td> Hide Add New Collection </td></tr></tbody></table>

<h3>Treat Periodicals as Books</h3>
This feature causes periodicals to appear in the books and collections lists. With this setting enabled, periodicals don't get any special treatment. It disables both notifications in the Home menu and the special navigation interface shown when reading a periodical.<br>
<br>
<b>TIP:</b> Overall performance can be improved by enabling this setting, since it disables the periodicals filter used by the home menu booklist.<br>
<br>
<h3>Set New Flag Manually</h3>
When you add a new book to your Reader, it automatically gets a "New" flag or badge. Normally this flag disappears once the book is opened, even if only for a second. By enabling this option, the "New" flag remains until you manually remove it using an on/off toggle in the Options menu. You can also manually restore the "New" flag if you change your mind.<br>
<br>
<hr />
<h2>Status Bar</h2>
<h3>Clock</h3>
<h4>Clock Style</h4>
<table><thead><th> 24-hour </th><th> example: 17:45 </th></thead><tbody>
<tr><td> 12-hour </td><td> example: 5:45pm </td></tr></tbody></table>

<h4>Clock Mode</h4>
<table><thead><th> Always shown </th><th> Clock is visible everywhere except in games and utilities </th></thead><tbody>
<tr><td> Shown only in menu </td><td> Clock is shown only in main menu                          </td></tr>
<tr><td> Shown only when reading </td><td> Clock is shown only when reading a book                   </td></tr>
<tr><td> Off          </td><td> Clock is never shown                                      </td></tr></tbody></table>

<h3>Page Index</h3>
This feature allows you to choose the style for the page index in books, e.g. 1 of 259 (0%).<br>
Supported modes are:<br>
<table><thead><th> Always shown </th><th> Index will always be shown </th></thead><tbody>
<tr><td> Not shown on single pages </td><td> Not shown in "1 of 1" situations </td></tr>
<tr><td> Never shown  </td><td> Index is disabled          </td></tr></tbody></table>

<hr />
<h2>Actions</h2>
<h3>Utilities</h3>
<table><thead><th> Book History </th><th> Jumps to the corresponding list </th></thead><tbody>
<tr><td> Browse Folders </td><td> Jumps to the corresponding list </td></tr>
<tr><td> Take a Screenshot </td><td> Takes a screenshot in jpg format, saving it either to internal memory or an external card, depending on the settings </td></tr>
<tr><td> Page Turn with Gestures on/off </td><td> Toggles page turn gestures on and off (available only on readers with touch screen) </td></tr></tbody></table>

<h3>Games</h3>
Launches corresponding game.<br>
<br>
<h3>Other</h3>
<table><thead><th> Shutdown </th><th> Completely powers off the reader </th></thead><tbody>
<tr><td> Sleep mode </td><td> Puts reader into sleep mode      </td></tr>
<tr><td> Rotate Counter-Clockwise </td><td> Rotates screen counter-clockwise </td></tr>
<tr><td> Rotate Clockwise </td><td>Rotates screen clockwise          </td></tr>
<tr><td> Rotate 0° </td><td> -                                </td></tr>
<tr><td> Rotate 90° </td><td> Rotates screen 90°              </td></tr>
<tr><td> Rotate 180° </td><td> Rotates screen 180°             </td></tr>
<tr><td> Rotate 270° </td><td> Rotates screen 270°             </td></tr>
<tr><td> Next Song </td><td> Jumps to the next song in the list </td></tr>
<tr><td> Previous Song </td><td> Jumps to the previous song in the list </td></tr>
<tr><td> Cycle Home Menu Booklist </td><td> Switches between book list modes (last added, last opened, etc) </td></tr></tbody></table>

<h3>Book</h3>
<table><thead><th> Next/Previous Page </th><th> Jumps to the next or previous page (works only when reading books) </th></thead><tbody>
<tr><td> Next/Previous in History </td><td> Jumps to the next/previous page in history. This is very handy in books with links as it allows you to jump "back" to the starting position, after clicking a link. </td></tr>
<tr><td> Continue Reading   </td><td> Jumps to the current book                                          </td></tr>
<tr><td> Open Options       </td><td> Opens option menu                                                  </td></tr>
<tr><td> Search             </td><td> Opens search menu (350/650/950)                                    </td></tr>
<tr><td> Previous Menu (Back / Up) </td><td> Executes "back" action (same as holding "options" menu on 350/600/650/950 or "menu"/"back" buttons on 505/300 </td></tr>
<tr><td> Size               </td><td> Opens font size menu (350/650/950)                                 </td></tr>
<tr><td> Go to Home         </td><td> Jumps to main/Home menu                                            </td></tr>
<tr><td> Open TOC           </td><td> Opens the current book's Table of Contents (works only when reading a book) </td></tr>
<tr><td> Open Notes List    </td><td> Jumps to notes                                                     </td></tr>
<tr><td> Zoom Page          </td><td> Opens zoom menu                                                    </td></tr></tbody></table>

<hr />
<h1>Advanced topics</h1>
<h2>How Card Scan and Cache Work</h2>
Every time you disconnect your Reader from the USB port on your computer, or restart/reset it, or (re-)insert an SD/MS card, the Reader scans the SD/MS card looking for books/images, and reads the metadata (author, title, etc.) for each new book. Book metadata (along with information like bookmarks and current page) is then stored in the "Sony Reader" folder, which is created as a result of the scanning process. The scanning process also removes references to books that were deleted (or moved/renamed).<br>
<br>
Scanning an SD/MS card is slower than scanning internal memory (which is also scanned, but its cache files are located in a different folder called "database"). This is due to the way the Reader accesses the card (for tech savvy users: mtools like utility).<br>
<br>
The most important consequence of using the "Disabled (load cache)" option is that if you delete a book (which was opened and hence appears in the cache file) from the SD card using your PC, the Reader will not know that you've done so and will still show the book in a book list. If you try to open the book, it will result in an "invalid book" message. It is safe to delete the cache (in the "Sony Reader" folder) on SD/MS cards as long as you don't care about bookmarks and "current page" information. (This only affects books on the corresponding card.)<br>
<br>
<h2>folders.cfg</h2>
When <a href='#Favorite_folders.md'>Favorite folders</a> is enabled, <a href='#Browse_Folders.md'>Browse Folders</a> will use the configuration defined in the folders.cfg file below.<br>
<br>
The file format is: <code>&lt;name&gt; &lt;tab character&gt; &lt;path&gt;</code><br>
Any line that starts with "#" is treated as a comment.<br>
<br>
Sample file (note that path to internal memory is "/Data/" not "/"):<br>
<pre><code># If "MyBooks" folder exist in internal memory, <br>
# it will be displayed as "My Books" and open <br>
# /MyBooks folder, if selected<br>
My Books	/Data/MyBooks<br>
# If memory stick is present, it will be <br>
# shown as "MS Card" and open "books" folder <br>
# on memory stick, if selected<br>
MS Card	a:<br>
# If SD card is present, it will be shown <br>
# as "SD Card" and open "books" folder on memory<br>
# stick, if selected<br>
SD Card	b:<br>
</code></pre>

<h2>prsp.sh</h2>
If this file is present in /database/system/PRSPlus, it is executed during PRS+ boot. (Note that the path to internal memory is "/Data/" not "/")<br>
<br>
<h2>Replacing LRF Fonts</h2>
For information on replacing LRF fonts, please check the <a href='http://code.google.com/p/prs-plus/wiki/HowToCustomFonts'>How To Custom Fonts</a> wiki page on the PRS+ project site.<br>
<br>
<h2>CSS in epubs</h2>
For information on adding custom CSS files and especially on using custom fonts, see<br>
<a href='http://www.anamardoll.com/2011/06/ereader-epub-font-customization-with.html'>Ana Mardoll's blog</a> and multiple threads on Mobile Read, such as <a href='http://www.mobileread.com/forums/showthread.php?t=154685'>this one</a>.