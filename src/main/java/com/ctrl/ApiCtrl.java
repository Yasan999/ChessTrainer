package com.ctrainer.ctrl;

import com.ctrainer.model.Res;
import com.ctrainer.model.Usr;
import com.ctrainer.repo.ResRepo;
import com.ctrainer.repo.UsrRepo;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class ApiCtrl {

    private final UsrRepo urp;
    private final ResRepo rrp;
    private final PasswordEncoder pwe;

    public ApiCtrl(UsrRepo urp, ResRepo rrp, PasswordEncoder pwe) {
        this.urp = urp;
        this.rrp = rrp;
        this.pwe = pwe;
    }

    @PostMapping("/reg")
    public ResponseEntity<Usr> reg(@RequestBody Usr usr) {
        if (urp.findByNick(usr.getNick()).isPresent()) {
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }
        usr.setPwd(pwe.encode(usr.getPwd()));
        Usr saved = urp.save(usr);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<Usr> login(@RequestBody Map<String, String> creds) {
        Optional<Usr> oUsr = urp.findByNick(creds.get("nick"));
        if (oUsr.isPresent()) {
            Usr usr = oUsr.get();
            if (pwe.matches(creds.get("pwd"), usr.getPwd())) {
                return new ResponseEntity<>(usr, HttpStatus.OK);
            }
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }
    
    @GetMapping("/usr/{uid}")
    public ResponseEntity<Usr> getUsr(@PathVariable Long uid) {
        return urp.findById(uid)
                .map(usr -> new ResponseEntity<>(usr, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/usr/{uid}/bg")
    public ResponseEntity<Void> updateBg(@PathVariable Long uid, @RequestBody Map<String, String> payload) {
        Optional<Usr> oUsr = urp.findById(uid);
        if (oUsr.isPresent()) {
            Usr usr = oUsr.get();
            usr.setBg(payload.get("bg"));
            urp.save(usr);
            return new ResponseEntity<>(HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping("/res")
    public Res saveRes(@RequestBody Map<String, Object> pld) {
        Res res = new Res();
        res.setUid(Long.parseLong(pld.get("uid").toString()));
        res.setScr(Integer.parseInt(pld.get("scr").toString()));
        res.setMod(pld.get("mod").toString());
        res.setTs(LocalDateTime.now());
        return rrp.save(res);
    }

    @GetMapping("/prof/{uid}")
    public List<Res> getProf(@PathVariable Long uid) {
        return rrp.findByUidOrderByTsDesc(uid);
    }
    
    @GetMapping("/all")
    public List<Usr> getAllUsers() {
        return urp.findAll();
    }
}