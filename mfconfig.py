class Error(Exception):
    pass


class OptionError(Error):
    pass


class ReadError(Error):
    pass


class config:
    def __init__(self, path):
        self._path = path
        self._data = {}
        self.parse()

    def parse(self):
        try:
            fp = open(self._path)
        except IOError, e:
            raise ReadError(str(e))
        while True:
            line = fp.readline()
            if not line:
                break
            # remove blanks and breaks
            line = line.strip()
            # check for comments
            if line == '' or line[0] in '#;' or line[0:2] == '//':
                continue
            (option, value) = line.split('=', 1)
            self._data[option.strip()] = value.strip()

    def get(self, option):
        try:
            return self._data[option]
        except (NameError, KeyError):
            raise OptionError('Unkown option "' + option + '"')

    def getint(self, option):
        return int(self.get(option))

    def getbool(self, option):
        if self._data[option].lower() in ('0', 'false', 'no') or self._data[option] == '':
            return False
        else:
            return True

    def exists(self, options):
        missing = []
        for option in options:
            try:
                self._dummydo(self._data[option])
            except (NameError, KeyError):
                missing.extend((option,))
        if len(missing) == 0:
            return None
        return tuple(missing)

    def _dummydo(self, var):
        return

# vim: set expandtab softtabstop=4 tabstop=4 shiftwidth=4:
